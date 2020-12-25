import axios from 'axios';

const baseUrl = 'https://api.github.com'
const owner = 'm0ngr31';
const repository = 'jellyamp'; 


const GithubService = {

    getLatestVersion: async () => {
        const result = await axios.get(
            `${baseUrl}/repos/${owner}/${repository}/releases`
        );

        console.log(result);
    }

}

export default GithubService;