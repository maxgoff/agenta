import {useCallback} from "react"

import {Alert} from "antd"
import clsx from "clsx"

import {findVariantById} from "@/oss/components/NewPlayground/hooks/usePlayground/assets/helpers"
import {getMetadataLazy} from "@/oss/lib/hooks/useStatelessVariants/state"
import {ArrayMetadata} from "@/oss/lib/shared/variant/genericTransformer/types"

import {createObjectFromMetadata} from "../../../../../lib/shared/variant/genericTransformer/helpers/arrays"
import type {EnhancedVariant} from "../../../../../lib/shared/variant/transformer/types"
import AddButton from "../../../assets/AddButton"
import {componentLogger} from "../../../assets/utilities/componentLogger"
import usePlayground from "../../../hooks/usePlayground"
import PromptMessageConfig from "../../PromptMessageConfig"
import type {PromptCollapseContentProps} from "../types"

/**
 * PlaygroundVariantConfigPromptCollapseContent renders the configuration interface
 * for a single prompt's messages.
 *
 * Features:
 * - Displays a list of configurable messages for the prompt
 * - Allows adding new messages
 * - Manages message configurations through the playground state
 *
 * @component
 */
const PlaygroundVariantConfigPromptCollapseContent: React.FC<PromptCollapseContentProps> = ({
    variantId,
    promptId,
    className,
    ...props
}) => {
    const {isCustom, inputKeys, messageIds, mutateVariant, hasVariable, mutate} = usePlayground({
        variantId,
        hookId: "PlaygroundConfigVariantPrompts",
        variantSelector: useCallback(
            (variant: EnhancedVariant) => {
                const prompt = (variant.prompts || []).find((p) => p.__id === promptId)
                const messages = prompt?.messages

                if (!messages) {
                    return {messageIds: []}
                }

                return {
                    messageIds: messages.value.map((message) => message.__id),
                    inputKeys: prompt.inputKeys.value || [],
                    hasVariable: prompt.inputKeys.value.length > 0,
                    isCustom: variant.isCustom,
                }
            },
            [promptId],
        ),
    })

    const addNewMessage = useCallback(() => {
        if (!mutateVariant) return

        mutateVariant((draft) => {
            const variantPrompt = draft.prompts?.find((p) => p.__id === promptId)
            const messages = variantPrompt?.messages.value
            const parentMetadata = getMetadataLazy<ArrayMetadata>(
                variantPrompt?.messages.__metadata,
            )
            const metadata = parentMetadata?.itemMetadata

            if (variantPrompt && messages && metadata) {
                const newMessage = createObjectFromMetadata(metadata) as (typeof messages)[number]
                if (newMessage) {
                    messages.push(newMessage)
                }
            }

            return draft
        })
    }, [mutateVariant, promptId])

    const deleteMessage = useCallback(
        (messageId: string) => {
            if (!mutateVariant) return

            mutate(
                (clonedState) => {
                    if (!clonedState) return clonedState

                    const variant = findVariantById(clonedState, variantId)

                    if (!variant) return clonedState

                    const variantPrompt = variant.prompts?.find((p) => p.__id === promptId)
                    const messages = variantPrompt?.messages.value

                    if (variantPrompt && messages) {
                        // Filter out the message with the specified ID
                        variantPrompt.messages.value = messages.filter(
                            (message) => message.__id !== messageId,
                        )
                    }

                    return clonedState
                },
                {revalidate: false},
            )
        },
        [mutateVariant, promptId],
    )

    componentLogger(
        "PlaygroundVariantConfigPromptCollapseContent",
        variantId,
        messageIds,
        inputKeys,
    )

    return (
        <div className={clsx("flex flex-col gap-2 pt-3", className)} {...props}>
            {messageIds.map((messageId) => (
                <PromptMessageConfig
                    key={messageId}
                    variantId={variantId}
                    messageId={messageId}
                    deleteMessage={deleteMessage}
                    editorType="border"
                    editorClassName="min-h-4 [&_p:last-child]:!mb-0"
                    isMessageDeletable={messageIds?.length === 1}
                />
            ))}

            {!isCustom && !hasVariable && (
                <Alert
                    closable
                    message={
                        <>
                            Insert a <span className="font-semibold">{"{{ variable }}"}</span> in
                            your template to create an input.
                        </>
                    }
                    type="info"
                    showIcon
                />
            )}

            <AddButton className="mt-2" size="small" label="Message" onClick={addNewMessage} />
        </div>
    )
}

export default PlaygroundVariantConfigPromptCollapseContent
