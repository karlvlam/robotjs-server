# Just a web api wrapper for robotjs


## Setup
robotjs needs C++ library to build, please refer to https://github.com/octalmage/robotjs/blob/master/README.md#building
```
npm install
```

Example:

1. moving the mouse pointer to (100,150)
2. perform a mouse click
```
curl -i -X POST -H "Content-Type: application/json" -d '{"cmd":"[{\"fn\":\"moveMouseSmooth\",\"args\":[100,150]}, {\"fn\":\"mouseClick\", \"args\":[]}]"}' 127.0.0.1:3000/task
```

