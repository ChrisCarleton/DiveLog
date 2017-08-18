# Error Responses

[Back to API documentation](./api.md)

Errors are reported using a consistent JSON format:

```javascript
{
	errorId: [integer],
	error: [string],
	details: [string]
}
```

The fields are as follows:
* __errorId:__ In integer uniquely identifying the type of error being returned.
* __error:__ A general description of the error.
* __details:__ A further description of the error.

## Error IDs
* __1000:__ Invalid form input.
* __1010:__ Requested user name is already taken.
* __1020:__ Requested e-mail address is already taken.
* __2000:__ Unknown server error.
* __2100:__ Resource not found.
* __3000:__ Authentication failed.
* __3100:__ Not authorized.
* __3200:__ Action forbidden.
