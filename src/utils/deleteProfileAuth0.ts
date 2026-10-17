import { ManagementClient } from 'auth0';


const domain = process.env.AUTH0_DOMAIN;
const clientId = process.env.AUTH0_M2M_CLIENT_ID;
const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

if (!domain || !clientId || !clientSecret) {
  throw new Error('Missing Auth0 environment variables!');
}

const auth0Management = new ManagementClient({ domain, clientId, clientSecret });

/**
 * @param {string} userId - Auth0 ID "auth0|65858efa24db1b5e4bc13e86"
 */
export async function deleteUserFromAuth0(userId: string) {
  try {
    await auth0Management.users.delete(userId);
    console.log(`User ${userId} successfully deleted from Auth0`);
    return true;
  } catch (error) {
    console.error('Error deleting user from Auth0:', error);
    throw error;
  }
}