
import GithubService from '../services/github';
import compareVersions from 'compare-versions';


const UpdateService = {
    isUpdateAvailable: async () => {

        const latestVersion = await GithubService.getLatestVersion();
        const currentVersion = window._app_version;

        return compareVersions(latestVersion, currentVersion) === 1;
    }
}

export default UpdateService;