const searchService = require('../services/searchService');

exports.searchInUsers = async (req,res) => {
    try {
        const queryParam = req.query.query;

        const users = await searchService.searchInUsers(queryParam);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.searchInContents = async (req,res) => {
    try {
        const queryParam = req.query.query;

        const contents = await searchService.searchInContents(queryParam);
        res.status(200).json(contents);
    } catch (error) {
        res.status(500).send(error.message);
    }
};


exports.searchInTotal = async (req,res) => {
    try {
        const queryParam = req.query.query;

        const [users, contents] = await Promise.all([
            searchService.searchInUsers(queryParam),
            searchService.searchInContents(queryParam)
        ]);

        res.status(200).json({
            users, contents
        })
    } catch (error) {
        res.status(500).send(error.message);
    }
};