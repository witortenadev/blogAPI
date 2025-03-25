const URL = "http://localhost:3000/comment/"
const bodyObject = {
    content: "message01010101",
    author: "author01",
    post: "67b8cad5e471460c015f743b"
}

fetch(URL, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2UzMTFkNzQ1NzZmMWM3YTYyNWU5NmMiLCJlbWFpbCI6IndpdG9ydGVuYUBlZHUudW5pZmlsLmJyIiwiaWF0IjoxNzQyOTM0NDk2LCJleHAiOjE3NDI5MzgwOTZ9.qpmy4Kp0spBFo8M7TbBAihr6C6WPeVWYBNgYDZA7kro",
    },
})
.then(res => res.json())
.then(data => console.log(data))
.catch(e => console.log(e))