const _ = require('lodash');
const fs = require('fs');
const axios = require('axios');

const url = 'https://raw.githubusercontent.com/MicrosoftDocs/azure-docs/master/articles/active-directory/users-groups-roles/licensing-service-plan-reference.md';


const FetchMarkdown = () => {
    const options = {
        method: 'get',
        url: url,
    };
    return axios(options)
        .then(function (response) {
            return Promise.resolve(response.data);
        });
}

const parseArray = (arr) => {
    const parsedArray = [];
    _.some(arr, (l, index) => {
        const productString = _.trim(l, '|').split('|');
        parsedArray.push(
            {
                productName: productString[0].trim(),
                stringID: productString[1].trim(),
                guid: productString[2].trim(),
                servicePlansIncluded: productString[3].trim(),
                servicePlansIncludedFriendlyNames: productString[4].trim(),
            }
        );
        return arr[index+1] === '';
    });
    return parsedArray;
}


const main = async () => {
    try {
        const response = await FetchMarkdown();
        const lines = response.split('\n');
        const index = _.findIndex(lines, (l) => {
            return _.startsWith(l, '|');
        });
        const splitLines = lines.splice(index + 2);
        const parsed = parseArray(splitLines);
        fs.writeFileSync('./data.json', JSON.stringify(parsed, null, 2) , 'utf-8');
    } catch (error) {
        console.log(error);
    }
}

main();