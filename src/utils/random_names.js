const { uniqueNamesGenerator, adjectives, colors, names, countries } = require('unique-names-generator');

const generateRandomName = () => {
    return uniqueNamesGenerator({ dictionaries: [adjectives, colors, countries, names], style: 'capital' }) + "_" + Math.floor(Date.now()/1000)%10000; 
}

module.exports = {
    generateRandomName
}