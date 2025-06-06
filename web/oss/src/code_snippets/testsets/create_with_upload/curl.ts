import {isDemo} from "@/oss/lib/helpers/utils"

export default function cURLCode(uri: string): string {
    return `curl -X POST ${uri} \\
-H 'Content-Type: multipart/form-data' \\
-F 'file=@/oss/path/to/your/file.csv' \\
-F 'testset_name=your_testset_name' \\
${!isDemo() ? "" : "-H 'Authorization: your_api_key'"}`
}
