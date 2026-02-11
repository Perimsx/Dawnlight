import { readConfigFile, ConfigPaths } from '../../utils/helpers'

export default defineEventHandler(async (event) => {
    const links = await readConfigFile(ConfigPaths.LINKS_CONFIG_FILE)

    return {
        success: true,
        data: links || { recommended: [], applicationTitle: '友链申请', applicationInfo: '', requirements: [], note: '' },
        cached: false
    }
})
