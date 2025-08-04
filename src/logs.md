1. a url shortener app , so somebody provides a long url and we shall provide the code a very short one spanning to just few words which will link to the same web-page that the url links to ,  

2. we will use postgre as database and prisma as orm,
3. okay so the database will be used to store the mapping of the url and the alias for the url provided which we shall generate,

4. Core functionality of the app : 
    1. URL Shortening : the primary function is take a long URL as input and generate a shorter, unique alias (e.g., using a hash function or sequential IDs.)
    2. Redirection : when a user visits the short url the app redirects them to the original long url, 
    3. Storage : A database is needed to store the mapping between the shortened url's and their corresponding long URLs

5. so we only generate a new short url only when the url provided for shortening is not already present in the database else we will have many short urls for the same long URL which i assume is unnecessary 

7. so probably the reason why we have to store the short versions of the URLs and provide them the same url whenever they ask for the same URL to be shortened is because it's very hard to ensure that we generate a unique url everytime they ask for it , collision seems to be something very difficult to avoid,  

8. the reason why we need to use the database to store the mapping short_URL -> original_URL, because the hashed URLs from the most hashing algorithms are not invertible,  

###########################################################################

1. okay it's simple what we will do is => 
    1. we will create a route for the user to provide the url in the request body
    2. a database lookup to make sure that we don't already have the shortened url for the same URL  
    3. if not we will hash it using some hashing algorithm , 
    4. give the shortened link to the user
    5. store the mapping of the hashed url and the original url in the database, 


2. how do i produce a unique url for a provided url , maintain a counter and increment it for each new url and encode this count into Base62 string and done that's your new_url/alias for the provided url,  


3. so the plan to encode the url is following : 
1. change the url into binary ,
2. turn it into base62 encoding 
2. add the counter(also changed into binary) simply append it to the end; 