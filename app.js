const AWS = require('aws-sdk');
const cognito = require('amazon-cognito-identity-js');

AWS.config.region = 'us-west-1'; // e.g. 'us-east-1'
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-west-1:e64e236a-5b5d-41f5-a2a1-b214f1685486'
});

const userPool = new cognito.CognitoUserPool({
    UserPoolId: 'us-west-1_M2jJZtHVJ',
    ClientId: '51d7r8k09q3l83nkkogstgftef'
});

const lambda = new AWS.Lambda();

document.getElementById('collectibleForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const collectible = {
        collectibleId: `collectible-${Date.now()}`,
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        value: document.getElementById('value').value,
        acquiredDate: document.getElementById('acquiredDate').value
    };

    const params = {
        FunctionName: 'CollectibleHandlerFunction',
        Payload: JSON.stringify({ action: 'add', ...collectible })
    };

    try {
        const result = await lambda.invoke(params).promise();
        console.log(result);
        fetchCollectibles();
    } catch (error) {
        console.error(error);
    }
});

async function fetchCollectibles() {
    const params = {
        FunctionName: 'CollectibleHandlerFunction',
        Payload: JSON.stringify({ action: 'get' })
    };

    try {
        const result = await lambda.invoke(params).promise();
        const collectibles = JSON.parse(result.Payload);
        const list = document.getElementById('collectibleList');
        list.innerHTML = '';
        collectibles.forEach((collectible) => {
            const item = document.createElement('li');
            item.textContent = `${collectible.name} - ${collectible.category} - ${collectible.description} - $${collectible.value} - ${collectible.acquiredDate}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteCollectible(collectible.collectibleId);
            item.appendChild(deleteButton);
            list.appendChild(item);
        });
    } catch (error) {
        console.error(error);
    }
}

async function deleteCollectible(collectibleId) {
    const params = {
        FunctionName: 'CollectibleHandlerFunction',
        Payload: JSON.stringify({ action: 'delete', collectibleId })
    };

    try {
        const result = await lambda.invoke(params).promise();
        console.log(result);
        fetchCollectibles();
    } catch (error) {
        console.error(error);
    }
}

fetchCollectibles();
