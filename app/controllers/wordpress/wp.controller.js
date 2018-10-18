module.exports = function(WP_URL, LANGS) {
    var module = {};
    var request = require('request');
    var winston = require('../../../config/winston');

    var Config = require('./../../../config/config'),
    config = new Config();

    var defaultLang = LANGS[0];

    var answersTotal;
    var answerCount;

    // wpStorage that will be updated when expiration reached, without any impact of the call to the api (this is never sent directly back to an api call, but updates wpStorage when all data has been retrieved)
    var wpStorageTmp = {
        expiration: null
    };
    // wpStorage that will contain the last set of retrieved data (is updated when the whole set of data has been retrieved), in order to send the last set of data even if a new set of data is being retrieved (after an expiration)
    var wpStorage = {
        expiration: null
    };


    /*
     *
     * WP General related routes
     *
     */

    module.getWP = function (req, res) {
        request({
            uri: WP_URL + '/wp/v2',
            method: 'GET',

        }, function(error, response, body) {
            winston.info(response);
            res.json(JSON.parse(body));
        });

    };

    module.getPages = function (req, res) {
        var lang = req.query.lang ? req.query.lang : defaultLang;
        if(wpStorage[lang]) {
            if(sizeOf(wpStorage[lang]['pages']) > 0) {
                checkExpiration(wpStorage.expiration, initialize);
                res.json(wpStorage[lang]['pages']);
            } else {
                res.status(503).send('Service Unavailable');
            }
        } else {
            res.status(503).send('Service Unavailable');
        }     
    };

    module.getPosts = function (req, res) {
        var lang = req.query.lang ? req.query.lang : defaultLang;
        if(wpStorage[lang]) {
            if(sizeOf(wpStorage[lang]['posts']) > 0) {
                res.json(wpStorage[lang]['posts']);
                checkExpiration(wpStorage.expiration, initialize)
            } else {
                res.status(503).send('Service Unavailable');
            }
        } else {
            res.status(503).send('Service Unavailable');
        }                 
    };
 
    module.getCategories = function (req, res) {
        var lang = req.query.lang ? req.query.lang : defaultLang;
        if(wpStorage[lang]) {
            if(sizeOf(wpStorage[lang]['categories']) > 0) {
                res.json(wpStorage[lang]['categories']);
                checkExpiration(wpStorage.expiration, initialize);
            } else {
                res.status(503).send('Service Unavailable');
            }
        } else {
            res.status(503).send('Service Unavailable');
        }     
    };

    /**
     *
     * @param endpoint - Ex: /posts
     * @param store - Name of page for local storage
     * @param params - Query parameters (ex: {'slug': 'my-slug'})
     * @return Promise with either error, or endpoint response
     */
    var getPageFromAPI = function(endpoint, lang, store, type, params) {

        // updates the total number of answers we should retrieve before updating the set of data to send back to the api calls
        addCountAnswer();

        if(params && !params.per_page) {
            params.per_page = config.wp_per_page;
        }
        if(params) {
            params = '?'+getParams(params);
        } else {
            params = '?per_page='+config.wp_per_page;
        }
        
        
        return new Promise(function (resolve, reject) {
            request({
                uri: WP_URL + '/wp/v2'+endpoint+params,
                method: 'GET'
            }, function(error, response, body) {
                if (error) {
                    winston.info('getPageFromAPI error', error);       
                    return reject(error);
                }
                else {
                    
                    if(type) {
                        wpStorageTmp[lang][store][type] = JSON.parse(body);
                    } else {
                        wpStorageTmp[lang][store] = JSON.parse(body);
                    }
                    resolve(JSON.parse(body));
                }
            });
        });
    };

    /**
     *
     * @param query - http request query (passed by AngularJS as parameter)
     * @returns {string} - Formatted to be passed as a URL parameter (Ex: www.domain.com?slug=my-slug
     */
    function getParams(query) {
        if(query) {
            var params = '';
            var keys = Object.keys(query);
            keys.forEach(function (value, key) {
                params += value+'='+query[value];
                if(key + 1 < keys.length) {
                    // winston.info(keys.length, key + 1);
                    params += '&';
                }
            });
            return params;
        } else {
            return null;
        }
    }

    /**
     *
     * @param expiration - The current controller's expiration time
     * @param callback - Initialization function to reset local variables with API's values
     */
    function checkExpiration(expiration, callback) {
        var time = new Date();
        time = time.getTime();
        winston.info((expiration - time) / (1000));

        if(time > expiration) {
            callback();
        }
    }

    /**
     *
     * @param expirationDuration
     */
    function initExpiration(expirationDuration) {
        var time = new Date();
        var expiration = time.getTime() + expirationDuration; //1/2 hours
        wpStorage.expiration = expiration;
    }

    /**
     * Initialise the counter of answers from the backend to update the set of data to answer to the API calls
     */
    function initCountAnswers() {
        answersTotal = 0;
        answerCount = 0;
        winston.info('Count Answers - Initialization', answerCount, answersTotal);
    }
    /**
     * Updates the number of answers to wait for before updating the set of data to answer to the API calls
     */
    function addCountAnswer() {
        answersTotal++;
    }
    /**
     * Checks the difference between the number of answers that we should have from the backend and the actual answers we got. When this number is reached, we update the set of data to send back to the API calls
     */
    function checkCountAnswer() {
        answerCount++;
        if(answerCount >= answersTotal) {
            winston.info('Count Answer - Total Reached, Update data', answerCount, answersTotal);
            wpStorage = wpStorageTmp;
            initCountAnswers();
            return true;
        } else {
            return false;
        }
    }

    function initialize() {
        console.log(config);
        initCountAnswers();
        initExpiration(config.expiration);

        // ATTENTION, CELA NE RETOURNE QUE 30 POSTS !!

        if(LANGS.length > 0) {

            LANGS.forEach(function(lang) {
                if (wpStorageTmp[lang] === undefined) {
                    wpStorageTmp[lang] = {};
                }

                if (wpStorageTmp[lang]['categories'] === undefined) {
                    wpStorageTmp[lang]['categories'] = [];
                }
                if (wpStorageTmp[lang]['posts'] === undefined) {
                    wpStorageTmp[lang]['posts'] = {};
                }

                getPageFromAPI('/categories', lang, 'categories', null, {lang: lang})
                    .then(function(cats) {                        
                        wpStorageTmp[lang]['categories'] = cats;
                        checkCountAnswer();
                        cats.forEach(function(category) {
                            if (wpStorageTmp[lang]['posts'][category.slug]  === undefined) {
                                wpStorageTmp[lang]['posts'][category.slug] = [];
                            }
                            getPageFromAPI('/posts', lang, 'posts', category.slug, {categories: [category.id], lang: lang})
                                .then(function(success) {
                                    checkCountAnswer();
                                })
                        });
                    });


                if (wpStorageTmp[lang]['posts']['all'] === undefined) {
                    wpStorageTmp[lang]['posts']['all'] = [];
                }
                getPageFromAPI('/posts', lang, 'posts', 'all')
                    .then(function(success) {
                        checkCountAnswer();
                    })
            
                if (wpStorageTmp[lang]['pages'] === undefined) {
                    wpStorageTmp[lang]['pages'] = {};  
                }
                getPageFromAPI('/pages', lang, 'pages', null, {lang: lang})
                    .then(function(success) {
                        checkCountAnswer();
                    })
            });
        }
    }

    function sizeOf(object) {
        return Object.keys(object).length;
    }

    initialize();

    return module;
};
