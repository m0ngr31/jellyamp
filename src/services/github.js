import axios from 'axios';
import _ from 'lodash';

const baseUrl = 'https://api.github.com'
const owner = 'm0ngr31';
const repository = 'jellyamp'; 


const GithubService = {

    getLatestVersion: async() => {
        const response = await axios.get(
            `${baseUrl}/repos/${owner}/${repository}/releases`
        );

        return _.get(response, 'data.0.tag_name', window._app_version);
    }
}

export default GithubService;