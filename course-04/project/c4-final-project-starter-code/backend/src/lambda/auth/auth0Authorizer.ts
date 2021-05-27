import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-6co6-fbx.us.auth0.com/.well-known/jwks.json'

// const cet=`-----BEGIN CERTIFICATE-----
// MIIDDTCCAfWgAwIBAgIJZK0VjfdSLufKMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
// BAMTGWRldi02Y282LWZieC51cy5hdXRoMC5jb20wHhcNMjEwNTIzMTM1NDE5WhcN
// MzUwMTMwMTM1NDE5WjAkMSIwIAYDVQQDExlkZXYtNmNvNi1mYngudXMuYXV0aDAu
// Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Delm/KV10KQ+/1b
// UNgFmjORcBqUOzOREzg6XagWfZJ0KWI+F3rOrQGc9BAVkLHDzuW6Nayds97UwSWd
// 7gL9urEovGwMKNI7syBnERDa7zGwmDoMCR0MGvDpAvj9C90i8bjhK2/E+Ils1+Ts
// jMbL8R4H7/rHyYkLf8SlN+F7QCPIBOLFE3mvjFM8BRiXLX0IGVKMgC7VfJdQ7Lae
// TZepRJ8pcGZNRVVhKqbxGdshhEfzDUDMN4aulkgt1OiGtv2AcxMAhe1x7wam1YTD
// pEGuXZWrJrxBhlgYm+/SpAp2exc7E6B0mg2IB9sZS9kWkw9pkKSVyRKG8Iiij9lS
// RH3oPQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQITElExyRn
// F/I86ZZifmxh146oEDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
// AEgksS6QGbyc0p/kfHpZIB3qJE8wP1plzu8XQj6ziyqF+YpKRFcjUOKpS1U4OeIN
// 6xiKq4dTU0W8gmWp8sAbNkQogepkVv4rehyOLw3QgjTai0Y4kUzhEevfsM+1UOF1
// K+VSumZQR8SGwtNloJfx99jKHDbC13lfG0gbg912r5rOlt06sxPTuN3NOnbtGluj
// QlrbiDSQ9Ho+Uj+/rWDQOUGPu4IxUmX9SSAhQcPHvFHtH7E1qf/5mvsLvxvnLzEs
// jowOhTaebSivt2afAvSlLuDE9xOeWem9pPCJcGBd+PQ+cPPLmZ1x74ntzxSxvn9w
// r10CYuCe4rBH2Q8TJp2xzFM=
// -----END CERTIFICATE-----`



export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}


const getSigningKey = async (jwkurl, kid) => {
  let res = await Axios.get(jwkurl, {
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      'Access-Control-Allow-Credentials': true,
    }
  });
  let keys  = res.data.keys;
  // since the keys is an array its possible to have many keys in case of cycling.
  const signingKeys = keys.filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
      && key.kty === 'RSA' // We are only supporting RSA
      && key.kid           // The `kid` must be present to be useful for later
      && key.x5c && key.x5c.length // Has useful public keys (we aren't using n or e)
    ).map(key => {
      return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
    });
  const signingKey = signingKeys.find(key => key.kid === kid);
  if(!signingKey){
    throw new Error('Invalid signing keys')
    logger.error("No signing keys found")
  }
  logger.info("Signing keys created successfully ", signingKey)
  return signingKey
};


function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}


async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  let key = await getSigningKey(jwksUrl, jwt.header.kid)
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return  verify(token, key.publicKey, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
