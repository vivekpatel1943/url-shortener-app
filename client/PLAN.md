you need a form where the user can submit the url that he wants to shorten and you need a space where you can return the shortened url, 

I don't think we need to use the context API as it's gonna be a very small app, 

your alias should include the url to your website , so that you bring them to your own website =>  check if you have gotten the original url in the database of which you have the alias for from the user => then you redirect them to the original url, 

=> 
what i gotta do now is make sure that in my encodeUrl route i respond with a complete url , which can direct people to the original url ,  

=> 1. make the frontend better make it look prettier , 
2. push it and then clone it again , in the EC2 instance which you had rented for this url-shortener app , you might have to delete everything inside it ,  