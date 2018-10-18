// var config = require('./config.js').get(process.env.NODE_ENV);

module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return {
                wp_per_page: 60,
                lang: ['en', 'pt-br', 'fr'],
                lang_7c: ['en', 'fr'],
                expiration: (1/2)*60*60*1000,
                wordpress: {
                    url: 'http://localhost/rsw-site/wp-json',
                    url_7c: 'http://localhost/rsw-site/wp-json'
                    // url: 'https://test.regularswitch.com/clubebossa-frontend/site/backend/wp-json',
                }
            };
       
        case 'production':
            return {
                wp_per_page: 60,
                lang: ['en', 'pt-br', 'fr'],
                lang_7c: ['en', 'fr'],
                // expiration: 30*1000,
                expiration: (1/2)*60*60*1000,
                wordpress: {
                    // url: 'https://test.regularswitch.com/clubebossa-frontend/site/backend/wp-json',
                    // url: 'https://test.regularswitch.com/rsw/backend/wp-json',
                    url: 'http://www.regularswitch.com/backend/wp-json',
                    url_7c: 'http://v2.7-ciel.fr/wp-json'

                }
            }; 
        default:
            return {
                wp_per_page: 60,
                lang: ['en', 'pt-br', 'fr'],
                lang_7c: ['en', 'fr'],
                expiration: 30*1000,
                // expiration: (1/2)*60*60*1000,
                wordpress: {
                    url: 'http://localhost/rsw/backend/wp-json',
                    // url: 'http://www.regularswitch.com/backend/wp-json',
                    url_7c: 'http://v2.7-ciel.fr/wp-json'

                    // url: 'https://test.regularswitch.com/rsw/backend/wp-json',
                    // url: 'http://localhost/sites/clubebossa-frontend/backend/',
                }
            };
    }
};
