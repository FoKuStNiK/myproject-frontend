# MyProjectApi.DefaultApi

All URIs are relative to *http://localhost:5000/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**achievementsGet**](DefaultApi.md#achievementsGet) | **GET** /achievements | Получить достижения
[**newsGet**](DefaultApi.md#newsGet) | **GET** /news | Получить новости
[**supportGet**](DefaultApi.md#supportGet) | **GET** /support | Получить поддержку



## achievementsGet

> NewsGet200Response achievementsGet()

Получить достижения

### Example

```javascript
import MyProjectApi from 'my_project_api';

let apiInstance = new MyProjectApi.DefaultApi();
apiInstance.achievementsGet((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**NewsGet200Response**](NewsGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## newsGet

> NewsGet200Response newsGet()

Получить новости

### Example

```javascript
import MyProjectApi from 'my_project_api';

let apiInstance = new MyProjectApi.DefaultApi();
apiInstance.newsGet((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**NewsGet200Response**](NewsGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## supportGet

> NewsGet200Response supportGet()

Получить поддержку

### Example

```javascript
import MyProjectApi from 'my_project_api';

let apiInstance = new MyProjectApi.DefaultApi();
apiInstance.supportGet((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**NewsGet200Response**](NewsGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

