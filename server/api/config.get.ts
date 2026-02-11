import { readConfigFile, ConfigPaths } from '../utils/helpers'

export default defineEventHandler(async (event) => {
    const config = await readConfigFile(ConfigPaths.SITE_CONFIG_FILE, ConfigPaths.DEFAULT_SITE_CONFIG_FILE)

    // 即使配置文件不存在也不抛错，返回空对象让前端用默认值
    return {
        success: true,
        data: config || {}
    }
})
