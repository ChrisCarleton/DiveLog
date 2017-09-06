# Users

[Back to API documentation](./api.md)

## User JSON Object

This object is returned from many of the API calls below.

```javascript
{
	userId: [uuid],
	userName: [string],
	displayName: [string],
	email: [string],
	createdAt: [date/time],
	updatedAt: [date/time],
	location: [string],
	dateOfBirth: [date/time],
	certificationAgencies: [string],
	diverType: [string],
	numberOfDives: [string],
	role: [string],
	imageUrl: [url],
	hasPassword: [boolean]
}
```
Not all of the properties are guaranteed to be present; only the ones that have values set will be
returned for any given user.

* __userId:__ A UUID that uniquely identifies the user account. This the primary means by which users
can be identified - even if user names change!
* __userName:__ The user's unique user name.
* __displayName:__ Usually the user's full name. This is the name by which the user will be referred to in the UI.
* __email:__ The user's e-mail address.
* __createdAt:__ ISO date. Represents the date and time at which the user's profile was first created.
* __updatedAt:__ ISO date. Represents the date and time at which the user's profile was last modified. This value will be undefined until the first time changes are made to the user's profile.
* __location:__ String. Indicates where the user resides (city, region, etc.)
* __dateOfBirth:__ ISO date. Indicates the user's date of birth.
* __certificationAgencies:__ String. Lists the certification agencies with whom the user has received training.
* __diverType:__ String. The diver's level of skill/experience. One of `novice`, `vacation`, `typical`, `advanced`, `tech`, `commercial`, `divemaster`, or `instructor`.
* __numberOfDives:__ String. The approximate number of dives the user has logged in their lifetime. One of `unknown`, `no logs`, `0`, `<20`, `<50`, `<100`, `<500`, `<1000`, `<5000`, `<9000`, or `9000+`.
* __role:__ String. Indicates the user's role on the site. One of `user`, or `admin`.
* __imageUrl:__ String. A URL to an image of the user to be displayed with their profile.
* __hasPassword:__ Boolean. Indicates whether or not the user has a password set on their profile. Users who do not have passwords set cannot log in using the traditional username/password method. (They must use OAuth providers.)

## Create New User (Local)

Creates a new user account in the sytem.

### Route
```
POST /api/users/
```

### Data Params
```javascript
{
	usernName: [string],
	email: [string],
	password: [string],
	displayName: [string]
}
```

* __userName:__ Required. A unique user name to identify the new user. Must be alphanumeric though hyphens, underscores, and periods are allowed in the middle. Minimum lenght is 3 characters and maximum is 30.
* __email:__ Required. The e-mail address at which the new user can be contacted. This must also be unique to the user. Only valid e-mail addresses are accepted.
* __password:__ Required. A strong-ish password containing letters, numbers, and special characters. Minimum length is 7 characters and the maximum is 30.
* __displayName:__ Optional. An optional display name (usually the user's full name) to display on the site in place of the user name.

### Success Response
* __Status Code:__ 200

The details of the newly-created user account are returned as a User JSON Object.

### Error Response
* __Status Code 400:__ Bad request
  * __Error ID 1000:__ Validation error. One of the required parameters was omitted or a parameter contained an invalid value. Check the error details for what the problem was.
  * __Error ID 1010:__ User name is taken. The selected user name already belongs to a user in the database. Select a new user name and try again.
  * __Error ID 1020:__ Email is taken. The selected e-mail address already belongs to a user in the database. Perhaps an account recovery is in order?
* __Status Code 500:__ Internal server error.

## Get User Profile

Returns the user profile for the requested user.

### Route
```
GET /api/users/:userName
```
* __:userName__ The user name that identifies the user for which the profile should be returned.

### Success Response
* __Status Code:__ 200

A User JSON Object detailing the requested user profile is returned.

### Error Response
* __Status Code 401:__ User is currently unauthenticated or does not have permission to view the requested user profile.
* __Status Code 404:__ This is returned when a site administrator attempts to view the profile of a user that does not exist in the system. (Non-admin users will receive a 401 response for security reasons.)
* __Status Code 500:__ Internal server error.

## Get Current User Profile

Returns the user profile of the currently logged-in user.

### Route
```
GET /api/user/
```

This route is effectively an alias for `GET /api/users/{current_user}`. See documentation above for Get User Profile route.

## Update User Profile

Updates an existing user's profile.

### Route
```
PUT|PATCH /api/users/:userName
```
* __:userName__ The user name that identifies the user for which the profile should be updated.

### Data Params
```javascript
{
	displayName: [string],
	email: [string],
	location: [string],
	dateOfBirth: [string],
	certificationAgencies: [string],
	diverType: [string],
	numberOfDives: [string]
}
```

Any of these fields can be omitted if no update is necessary on that field (hence the `PATCH` route.)
Setting any of these fields to `null` will delete their values from the user's profile. These fields are the same as those found in the User JSON Object documented above. See that documentation for valid values.

__NOTE:__ `email` cannot be set to `null` because users _must_ have an e-mail address set on their account. Attempting this will result in a 403 (Forbidden Action) HTTP response and no updates will take place on the user's profile.

### Success Response
* __Status Code:__ 200

A User JSON Object is returned containing the user's profile information with the newly-imposed updates.

### Error Response
* __Status Code 400:__ Bad request. One or more of the fields contained invalid data. See the User JSON Object documentation above for details on what is valid for each of the fields. This error can also result when a field not documented here is included in the request.
* __Status Code 401:__ Not authorized. User is unauthenticated or not authorized to update the requested profile.
* __Status Code 403:__ Forbidden action. The update was refused for one of the following two reasons:
  * An attempt was made to delete the user's e-mail address (by setting `email` to `null`) or...
  * An attempt was made to set the user's e-mail address to one that is already registered to another user in the system.
* __Status Code 404:__ Not found. This is returned to administrative users who attempt to update profiles for users that do not exist. (Non-admins receive a 401 response for security reasons.)
* __Status Code 500:__ Internal server error.
