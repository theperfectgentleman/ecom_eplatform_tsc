#!/usr/bin/env node

/**
 * Create the remaining failed account with alternative username
 */

const API_BASE_URL = 'https://api.encompas.org/api';
const API_KEY = 'ab6dd734ad8cf02ca3711483155e8561cb7acb9eebf7fb3a9bc76669a412a060';
const REGION = 'North East';
const DISTRICT = 'Mamprugu Moagduri';

// Failed account data
const failedAccount = {
    name: 'Adam Wasidu',
    contact: '0543347748',
    subdistrict: 'Kubori',
    community: 'Zanwara'
};

function splitGhanaianName(fullName) {
    const parts = fullName.trim().split(' ');
    return {
        firstname: parts[0],
        lastname: parts.slice(1).join(' ')
    };
}

function generateEmail(firstname, lastname) {
    const firstTwoChars = firstname.substring(0, 2).toLowerCase();
    const surname = lastname.toLowerCase().replace(/\s+/g, '');
    return `${firstTwoChars}${surname}@encompas.org`;
}

async function makeApiRequest(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        console.log(`Making ${method} request to: ${url}`);
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API request failed: ${error.message}`);
        throw error;
    }
}

async function createFailedAccount() {
    const { name, contact, subdistrict, community } = failedAccount;
    const { firstname, lastname } = splitGhanaianName(name);
    
    // Use different username strategy - use last name + numbers
    const username = 'wasidu123';  // Alternative username
    const password = 'wasid1234';  // Alternative password
    const email = generateEmail(firstname, lastname);
    
    const accountData = {
        username,
        firstname,
        lastname,
        email,
        phone: contact,
        password,
        user_type: 'volunteer',
        access_level: 0, // COMMUNITY
        region: REGION,
        district: DISTRICT,
        subdistrict,
        community_name: community
    };
    
    try {
        const result = await makeApiRequest('accounts', 'POST', accountData);
        console.log(`✅ Created account for ${name}`);
        
        console.log('\n' + '='.repeat(80));
        console.log('UPDATED ACCOUNT LIST:');
        console.log('='.repeat(80));
        console.log('name, subdistrict, district, community, contact, username, password, role');
        console.log(`${name}, ${subdistrict}, ${DISTRICT}, ${community}, ${contact}, ${username}, ${password}, chv`);
        
        return true;
    } catch (error) {
        console.error(`❌ Failed to create account for ${name}: ${error.message}`);
        return false;
    }
}

// Run the script
createFailedAccount().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});
