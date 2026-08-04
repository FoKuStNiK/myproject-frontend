# MyProjectApi.DefaultApi

All URIs are relative to *http://localhost:5000/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**achievementsGet**](DefaultApi.md#achievementsGet) | **GET** /achievements | Получить достижения
[**newsGet**](DefaultApi.md#newsGet) | **GET** /news | Получить новости
[**supportGet**](DefaultApi.md#supportGet) | **GET** /support | Получить поддержку
[**tableDataCellPatch**](DefaultApi.md#tableDataCellPatch) | **PATCH** /table-data/cell | Обновить одну ячейку
[**tableDataDelete**](DefaultApi.md#tableDataDelete) | **DELETE** /table-data | Очистить таблицу
[**tableDataGet**](DefaultApi.md#tableDataGet) | **GET** /table-data | Получить таблицу



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


## tableDataCellPatch

> TableDataCellPatch200Response tableDataCellPatch(tableDataCellPatchRequest)

Обновить одну ячейку

### Example

```javascript
import MyProjectApi from 'my_project_api';

let apiInstance = new MyProjectApi.DefaultApi();
let tableDataCellPatchRequest = new MyProjectApi.TableDataCellPatchRequest(); // TableDataCellPatchRequest | 
apiInstance.tableDataCellPatch(tableDataCellPatchRequest, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **tableDataCellPatchRequest** | [**TableDataCellPatchRequest**](TableDataCellPatchRequest.md)|  | 

### Return type

[**TableDataCellPatch200Response**](TableDataCellPatch200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## tableDataDelete

> [[String]] tableDataDelete()

Очистить таблицу

### Example

```javascript
import MyProjectApi from 'my_project_api';

let apiInstance = new MyProjectApi.DefaultApi();
apiInstance.tableDataDelete((error, data, response) => {
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

**[[String]]**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## tableDataGet

> [[String]] tableDataGet()

Получить таблицу

### Example

```javascript
import MyProjectApi from 'my_project_api';

let apiInstance = new MyProjectApi.DefaultApi();
apiInstance.tableDataGet((error, data, response) => {
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

**[[String]]**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

