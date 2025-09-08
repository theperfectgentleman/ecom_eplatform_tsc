#!/usr/bin/env node

/**
 * Account Creation Script for Encompas Platform
 * Creates accounts for Midwives (CHVs) and Volunteers from provided data
 */

// Configuration
const API_BASE_URL = 'https://api.encompas.org/api';
const API_KEY = 'ab6dd734ad8cf02ca3711483155e8561cb7acb9eebf7fb3a9bc76669a412a060';
const REGION = 'North East';
const DISTRICT = 'Mamprugu Moagduri';

// User data from the attachments
const MIDWIVES_DATA = [
    { name: 'Gloria Danyagri', contact: '0541652353', subdistrict: 'Kunkua', community: 'Kunkua' },
    { name: 'Gifty Nanja', contact: '0207252716', subdistrict: 'Yikpabongo', community: 'Yizesi' },
    { name: 'Elizabeth Akeani', contact: '0247802653', subdistrict: 'Kubori', community: 'Kubori' },
    { name: 'Abigail Mensah', contact: '0546613212', subdistrict: 'Yagaba', community: 'Loagri' },
    { name: 'Esther Atanga', contact: '0246120383', subdistrict: 'Kunkua', community: 'Katigri' },
    { name: 'Pusu Damba', contact: '0246082599', subdistrict: 'Yagaba', community: 'Yagaba' },
    { name: 'Felix Anagli', contact: '0543887906', subdistrict: 'Kubori', community: 'Zanwara' },
    { name: 'Saibu Zulfawu Seinu', contact: '0240435657', subdistrict: 'Yikpabongo', community: 'Tantala' }
];

const CHVS_DATA = [
    { name: 'Mumuni Musah', contact: '0243952729', subdistrict: 'Yikpabongo', community: 'Tantala' },
    { name: 'Abdulai Abubakari', contact: '0552335325', subdistrict: 'Yagaba', community: 'Loagri' },
    { name: 'Anbiaba Moses', contact: '0543508926', subdistrict: 'Kunkua', community: 'Katigri' },
    { name: 'Mohammed Alimatu', contact: '0557885503', subdistrict: 'Yagaba', community: 'Yagaba' },
    { name: 'Analimbey Benjamin', contact: '0246745828', subdistrict: 'Kunkua', community: 'Kunkua' },
    { name: 'Muntari Ibrahim', contact: '0543318965', subdistrict: 'Yikpabongo', community: 'Yizesi' },
    { name: 'Adam Mugi', contact: '0554065091', subdistrict: 'Kubori', community: 'Kubori' },
    { name: 'Adam Wasidu', contact: '0543347748', subdistrict: 'Kubori', community: 'Zanwara' }
];

// Utility functions
function splitGhanaianName(fullName) {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
        return {
            firstname: parts[0],
            lastname: parts.slice(1).join(' ')
        };
    }
    return {
        firstname: parts[0],
        lastname: parts[0] // fallback if only one name
    };
}

function generateUsername(firstname, lastname) {
    const shorterName = firstname.length <= lastname.length ? firstname : lastname;
    const baseName = shorterName.toLowerCase();
    
    // Add numbers to reach 7-10 characters
    let username = baseName;
    let counter = 123;
    
    while (username.length < 7) {
        username = baseName + counter;
        counter++;
    }
    
    // Ensure we don't exceed 10 characters
    if (username.length > 10) {
        username = username.substring(0, 7) + '123';
    }
    
    return username;
}

function generatePassword(username) {
    // Use part of username + sequence numbers
    const basePassword = username.length > 5 ? username.substring(0, 5) : username;
    const sequenceNumbers = '1234';
    let password = basePassword + sequenceNumbers;
    
    // Ensure 8-10 characters
    if (password.length < 8) {
        password += '56';
    }
    if (password.length > 10) {
        password = password.substring(0, 10);
    }
    
    return password;
}

function generateEmail(firstname, lastname) {
    const firstTwoChars = firstname.substring(0, 2).toLowerCase();
    const surname = lastname.toLowerCase().replace(/\s+/g, '');
    return `${firstTwoChars}${surname}@encompas.org`;
}

// API request function
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

// Create account function
async function createAccount(userData) {
    const { name, contact, subdistrict, community, userType, accessLevel } = userData;
    const { firstname, lastname } = splitGhanaianName(name);
    const username = generateUsername(firstname, lastname);
    const password = generatePassword(username);
    const email = generateEmail(firstname, lastname);
    
    const accountData = {
        username,
        firstname,
        lastname,
        email,
        phone: contact,
        password,
        user_type: userType,
        access_level: accessLevel,
        region: REGION,
        district: DISTRICT,
        subdistrict,
        community_name: community
    };
    
    try {
        const result = await makeApiRequest('accounts', 'POST', accountData);
        console.log(`✅ Created account for ${name}`);
        
        return {
            name,
            subdistrict,
            district: DISTRICT,
            community,
            contact,
            username,
            password,
            role: userType === 'clinician' ? 'mf' : 'chv',
            status: 'success'
        };
    } catch (error) {
        console.error(`❌ Failed to create account for ${name}: ${error.message}`);
        
        return {
            name,
            subdistrict,
            district: DISTRICT,
            community,
            contact,
            username,
            password,
            role: userType === 'clinician' ? 'mf' : 'chv',
            status: 'failed',
            error: error.message
        };
    }
}

// Main execution function
async function main() {
    console.log('🚀 Starting account creation process...\n');
    
    const results = [];
    
    // Process Midwives (Clinicians with subdistrict access)
    console.log('Creating accounts for Midwives (Clinicians)...');
    for (const midwife of MIDWIVES_DATA) {
        const result = await createAccount({
            ...midwife,
            userType: 'clinician',
            accessLevel: 1 // SUBDISTRICT
        });
        results.push(result);
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\nCreating accounts for CHVs (Volunteers)...');
    // Process CHVs (Volunteers with community access)
    for (const chv of CHVS_DATA) {
        const result = await createAccount({
            ...chv,
            userType: 'volunteer',
            accessLevel: 0 // COMMUNITY
        });
        results.push(result);
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Generate final report
    console.log('\n' + '='.repeat(100));
    console.log('ACCOUNT CREATION SUMMARY');
    console.log('='.repeat(100));
    
    console.log('\nSuccessful accounts:');
    console.log('name, subdistrict, district, community, contact, username, password, role');
    console.log('-'.repeat(100));
    
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');
    
    successful.forEach(account => {
        console.log(`${account.name}, ${account.subdistrict}, ${account.district}, ${account.community}, ${account.contact}, ${account.username}, ${account.password}, ${account.role}`);
    });
    
    if (failed.length > 0) {
        console.log('\n❌ Failed accounts:');
        console.log('-'.repeat(50));
        failed.forEach(account => {
            console.log(`${account.name}: ${account.error}`);
        });
    }
    
    console.log(`\n📊 Total: ${results.length} | ✅ Success: ${successful.length} | ❌ Failed: ${failed.length}`);
    
    // Save results to file (if in Node.js environment)
    try {
        const fs = await import('fs');
        const csvContent = [
            'name,subdistrict,district,community,contact,username,password,role,status',
            ...results.map(r => `"${r.name}","${r.subdistrict}","${r.district}","${r.community}","${r.contact}","${r.username}","${r.password}","${r.role}","${r.status}"`)
        ].join('\n');
        
        fs.writeFileSync('account-creation-results.csv', csvContent);
        console.log('\n💾 Results saved to account-creation-results.csv');
    } catch (error) {
        console.log('\n💾 Results not saved to file (file system not available)');
    }
}

// Check if we're running in Node.js environment
if (typeof window === 'undefined') {
    // Node.js environment - run the script
    main().catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    });
} else {
    // Browser environment - expose functions globally
    window.createAccountsScript = { main, createAccount, makeApiRequest };
    console.log('Script loaded. Run createAccountsScript.main() to execute.');
}
