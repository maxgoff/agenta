import {useEffect, useState} from "react"

import {Button, Input, Space, Typography, message} from "antd"
import dynamic from "next/dynamic"

import {useVaultSecret} from "@/oss/hooks/useVaultSecret"
import {type LlmProvider} from "@/oss/lib/helpers/llmProviders"

const ModelRegistryTable = dynamic(() => import("./ModelRegistryTable"), {ssr: false})

const {Title, Text} = Typography

export default function Secrets() {
    const {secrets, handleModifyVaultSecret, handleDeleteVaultSecret} = useVaultSecret()
    const [llmProviderKeys, setLlmProviderKeys] = useState<LlmProvider[]>([])
    const [loadingSecrets, setLoadingSecrets] = useState<Record<string, boolean>>({})
    const [messageAPI, contextHolder] = message.useMessage()

    useEffect(() => {
        setLlmProviderKeys(secrets)
    }, [secrets])

    const setSecretLoading = (id: string | undefined, isLoading: boolean) => {
        if (!id) return
        setLoadingSecrets((prev) => ({...prev, [id]: isLoading}))
    }

    return (
        <section className="flex flex-col gap-6">
            <div data-cy="secrets">
                {contextHolder}
                <Title level={3} className={"mt-0"}>
                    LLM Keys
                </Title>

                <div>
                    <Title level={5}>Available Providers</Title>

                    <div>
                        {llmProviderKeys.map(
                            ({name, title, key, id: secretId}: LlmProvider, i: number) => (
                                <Space direction="horizontal" key={i} className="mb-2 ml-2">
                                    <Input.Password
                                        data-cy="openai-api-input"
                                        value={key}
                                        onChange={(e) => {
                                            const newLlmProviderKeys = [...llmProviderKeys]
                                            newLlmProviderKeys[i].key = e.target.value
                                            setLlmProviderKeys(newLlmProviderKeys)
                                        }}
                                        addonBefore={`${title}`}
                                        visibilityToggle={false}
                                        className={"w-[420px]"}
                                    />
                                    <Button
                                        data-cy="openai-api-save"
                                        type="primary"
                                        disabled={!key}
                                        loading={loadingSecrets[secretId || ""] === true}
                                        onClick={async () => {
                                            try {
                                                setSecretLoading(secretId, true)
                                                await handleModifyVaultSecret({
                                                    name,
                                                    title,
                                                    key,
                                                    id: secretId,
                                                })
                                                messageAPI.success("The secret is saved")
                                            } finally {
                                                setSecretLoading(secretId, false)
                                            }
                                        }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        disabled={!key}
                                        loading={loadingSecrets[secretId || ""] === true}
                                        onClick={async () => {
                                            try {
                                                setSecretLoading(secretId, true)
                                                await handleDeleteVaultSecret({
                                                    name,
                                                    id: secretId,
                                                    title,
                                                    key,
                                                })
                                                const newLlmProviderKeys = [...llmProviderKeys]
                                                newLlmProviderKeys[i].key = ""
                                                newLlmProviderKeys[i].id = ""
                                                setLlmProviderKeys(newLlmProviderKeys)
                                                messageAPI.warning("The secret is deleted")
                                            } finally {
                                                setSecretLoading(secretId, false)
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </Space>
                            ),
                        )}
                    </div>
                </div>
            </div>

            <ModelRegistryTable />
        </section>
    )
}
