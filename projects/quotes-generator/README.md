# Inspirational Quote Generator

I made this project to learn about APIs, the GET method, async functions, and try/catch error handling. I also used API Ninjas to build this inspirational quote generator.

## About the Project

Inspirational Quote Generator is a simple web app that shows motivational quotes and lets the user refresh them with one click. It fetches random inspirational quotes from an API and displays them on the page.

## Features

- Shows inspirational quotes.
- Refreshes quotes with a button click.
- Uses the Fetch API to request data from an external API.
- Handles loading and error states with JavaScript.
- Built with HTML, CSS, and JavaScript.

## Technologies Used

- HTML
- CSS
- JavaScript
- API Ninjas Quotes API

## What I Learned

- How APIs work.
- How to make a GET request.
- How to use `async` and `await`.
- How to handle errors using `try` and `catch`.
- How to update the DOM dynamically with JavaScript.

## How It Works

1. The user clicks the **Refresh Quote** button.
2. JavaScript sends a GET request to the API Ninjas endpoint.
3. The response is converted to JSON.
4. A random quote is shown on the screen.
5. If something goes wrong, an error message is displayed.

## Project Structure

```bash
├── index.html
├── style.css
└── script.js
```

## API Used

This project uses the [API Ninjas Quotes API](https://api-ninjas.com/api/quotes).

## Code Notes

The app uses `fetch()` to call the API asynchronously, which is a standard way to make HTTP requests in JavaScript.

## Author

Made by Mahin H
