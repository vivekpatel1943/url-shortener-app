This project uses a custom URL-encoding algorithm to guarantee uniqueness, security, and consistent length for all shortened URLs.
Here’s how the encoding works internally:

✅ 1. Counter-Based Uniqueness
Every time the server receives a request to shorten a URL:
1. we check if the short URL for the url is already available in the database , it if is we serve the short url to the client else we encode and shorten it to save it in
  the database. 
2. A global counter in the database is incremented by 1.
3. The updated counter value is converted to binary.
4. The binary value is then encoded using Base62.
5. This encoded counter is later appended to the URL hash to ensure all shortened URLs remain unique.

✅ 2. Hashing the Original URL
To generate the main part of the short URL:
1. Convert the original URL into its binary representation, byte by byte.
2. Hash the binary data using SHA-256, a one-way cryptographic hash function.
3. Encode the hash output as Base64URL, which is URL-safe.
4. Extract the first 6 characters of the encoded hash
5. These 6 characters form a stable, deterministic signature of the URL.
6. This ensures that the short URL looks clean, compact, and predictable in length.

✅ 3. Final Short URL Format
The final shortened URL looks like:
<hashPrefix><encodedCounter>
Example:
aB9xYp3f      // (hash prefix = 6 chars) + (Base62 counter = variable length)
This value is stored in the database along with the original URL.

✅ 4. Redirection
When a user visits:
"https://your-domain.com/<shortCode>"

The backend:
1. Looks up the short code in the database.
2. Retrieves the original URL.
3. Performs an HTTP redirect to the original link.
