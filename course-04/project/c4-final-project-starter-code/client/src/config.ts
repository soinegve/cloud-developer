// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'ms8bsnoe1l'

///https://ms8bsnoe1l.execute-api.us-east-1.amazonaws.com/dev
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

//ttps://ms8bsnoe1l.execute-api.us-east-1.amazonaws.com/dev

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-6co6-fbx.us.auth0.com',            // Auth0 domain
  clientId: 'd5QuiDpHyAvo6O5zvv7PUAZebSlUg2gN',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
