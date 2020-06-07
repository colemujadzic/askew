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

class Handler {
    responseData: any;
    constructor(responseData: any) {
        this.responseData = responseData;
    }
    async fetchData() {
        if (this.responseData) {
            return this.responseData;
        }
        return fetchMarkdown().then((data: any) => {
            this.responseData = data;
            return Promise.resolve(this.responseData);
        });
    }
}
const dataHandler = new Handler(null);

// fetchMarkdown() makes a GET request to fetch the contents of the markdown file
const fetchMarkdown = () => {
    const options = {
        method: 'get',
        url: url,
    };
    // TODO: figure out a type here!
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
    const response = await dataHandler.fetchData();
    const lines = response.split('\n');
    const index = _.findIndex(lines, (l: string) => {
        return _.startsWith(l, '|');
    });
    const splitLines = lines.splice(index + 2);
    const body: Product[] = parseArray(splitLines);
    return body;
};

const productByID = async (id: any) => {
    try {
        const response = await dataHandler.fetchData();
        const lines = response.split('\n');
        const index = _.findIndex(lines, (l: string) => {
            return _.startsWith(l, '|');
        });
        const splitLines = lines.splice(index + 2);
        const products: Product[] = parseArray(splitLines);
        const product = _.find(products, (obj) => {
            return obj.stringID === id;
        });
        if (product) {
            const body: Product = product;
            return body;
        }
    } catch (error) {
        console.log(error);
    }
    return [];
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

// GET /Products<ID>
app.get('/products/:stringID', async (req, res) => {
    try {
        const productID = _.get(req.params, 'stringID', '');
        const body = await productByID(productID);
        res.setHeader('Content-Type', 'application/json');
        res.json(body);
    } catch (error) {
        console.log(error);
    }
});

app.listen(process.env.PORT ? process.env.PORT : 3000);
