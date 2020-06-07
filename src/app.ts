import 'reflect-metadata';
import _ from 'lodash';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios').default;
import express from 'express';
const app = express();

// the location of the markdown file
const url =
    'https://raw.githubusercontent.com/colemujadzic/azure-docs/master/articles/active-directory/users-groups-roles/licensing-service-plan-reference.md';

// a Microsoft online service product
interface Product {
    productName: string;
    stringID: string;
    guid: string;
    servicePlansIncluded: string | string[];
    servicePlansIncludedFriendlyNames: string | string[];
}

// fetchMarkdown() makes a GET request to fetch the contents of the markdown file
const fetchMarkdown = () => {
    const options = {
        method: 'get',
        url: url,
    };
    // TODO: figure out a type here!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return axios(options)
        .then((response: any) => {
            return Promise.resolve(response.data);
        })
        .catch((error: any) => {
            console.log(error.toJSON());
        });
};

// parseArray() takes an array of type string and parses out objects of type Product into a single array of objects
const parseArray = (arr: Array<string>) => {
    const products: Product[] = [];
    _.some(arr, (l: string, index: number) => {
        const productString = _.trim(l, '|').split('|');
        products.push({
            productName: productString[0].trim(),
            stringID: productString[1].trim(),
            guid: productString[2].trim(),
            servicePlansIncluded:
                productString[3].indexOf('<br/>') > -1
                    ? productString[3].trim().split('<br/>')
                    : productString[3].trim(),
            servicePlansIncludedFriendlyNames:
                productString[4].indexOf('<br/>') > -1
                    ? productString[4].trim().split('<br/>')
                    : productString[4].trim(),
        });
        return arr[index + 1] === '';
    });
    return products;
};

const productList = async () => {
    const response = await fetchMarkdown();
    const lines = response.split('\n');
    const index = _.findIndex(lines, (l: string) => {
        return _.startsWith(l, '|');
    });
    const splitLines = lines.splice(index + 2);
    const body: Product[] = parseArray(splitLines);
    return body;
};

// GET /Products
app.get('/products', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const body = await productList();
        res.json(body);
    } catch (error) {
        console.log(error);
    }
});

app.listen(3000);
