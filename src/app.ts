import 'reflect-metadata';
import _ from 'lodash';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import express from 'express';
const app = express();

// the location of the markdown file
const url =
    'https://raw.githubusercontent.com/MicrosoftDocs/azure-docs/master/articles/active-directory/enterprise-users/licensing-service-plan-reference.md';

// a Microsoft online service product
interface Product {
    productName: string;
    stringID: string;
    guid: string;
    servicePlansIncluded: string | string[];
    servicePlansIncludedFriendlyNames: string | string[];
}

class Handler {
    responseData?: string;
    constructor(responseData?: string) {
        this.responseData = responseData;
    }
    async fetchData() {
        if (this.responseData) {
            return this.responseData;
        }
        return fetchMarkdown().then((data: string) => {
            this.responseData = data;
            return Promise.resolve(this.responseData);
        });
    }
}
const dataHandler = new Handler();

// fetchMarkdown() makes a GET request to fetch the contents of the markdown file
const fetchMarkdown = () => {
    const options: AxiosRequestConfig = {
        method: 'get',
        url: url,
    };
    return axios(options)
        .then((response: AxiosResponse) => {
            return Promise.resolve(response.data);
        })
        .catch((error: AxiosError) => {
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
    return;
};

// GET /Products
app.get('/products', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const body = await productList();
        res.json(body);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// GET /Products<ID>
app.get('/products/:stringID', async (req, res) => {
    try {
        const productID = _.get(req.params, 'stringID', '');
        const body = await productByID(productID);
        res.setHeader('Content-Type', 'application/json');
        if (!body)
            res.status(404).json({
                status: 'error',
                message: 'Product with the specified stringID does not exist',
            });
        res.json(body);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.listen(process.env.PORT ? process.env.PORT : 3000);
