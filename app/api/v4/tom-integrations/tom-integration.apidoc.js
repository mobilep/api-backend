/**
 * @apiVersion 4.0.0
 * @api {GET} /company/:companyId/integration Get Integration Data
 * @apiName GetIntegration
 * @apiDescription Get integration info
 * @apiGroup Integrations
 * @apiHeader {String} Authorization* Access token
 * @apiParam (Path parameter) {String} companyId* company id
 * @apiParamExample {json} Request-Example:
 {
     "data": {
        "link": "https://some-api-url",
        "name": "project_api_name",
        "apiKey": "api_key_111",
        "apiSecret": "api_secret_111"
    }
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {POST} /company/:companyId/integration Create TOM Integration
 * @apiName GetIntegration
 * @apiDescription Create integration for company
 * @apiGroup Integrations
 * @apiHeader {String} Authorization* Access token
 * @apiParam (Path parameter) {String} companyId* company id
 * @apiParam (Body parameters) {String} name* Name
 * @apiParam (Body parameters) {String} link* API Link
 * @apiParam (Body parameters) {String} apiKey* API Key
 * @apiParam (Body parameters) {String} apiSecret* API Secret
 * @apiParamExample {json} Request-Example:
 {
     "status": "created"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {PATCH} /company/:companyId/integration Update TOM Integration
 * @apiName UpdateIntegration
 * @apiDescription Update integration for company
 * @apiGroup Integrations
 * @apiHeader {String} Authorization* Access token
 * @apiParam (Path parameter) {String} companyId* company id
 * @apiParam (Body parameters) {String} name* Name
 * @apiParam (Body parameters) {String} link* API Link
 * @apiParam (Body parameters) {String} apiKey* API Key
 * @apiParam (Body parameters) {String} apiSecret* API Secret
 * @apiParamExample {json} Request-Example:
 {
     "status": "updated"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {DELETE} /company/:companyId/integration Delete TOM Integration
 * @apiName DeleteIntegration
 * @apiDescription Delete company integration
 * @apiGroup Integrations
 * @apiHeader {String} Authorization* Access token
 * @apiParam (Path parameter) {String} companyId* company id
 * @apiParamExample {json} Request-Example:
 {
     "status": "deleted"
 }
 */
