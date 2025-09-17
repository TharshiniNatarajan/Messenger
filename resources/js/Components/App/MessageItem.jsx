import { usePage } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";
import React from "react";
import UserAvatar from "./UserAvatar";
import { formatMessageDateLong } from "@/helpers";
import MessageAttachments from "./MessageAttachments";
import MessageOptionsDropdown from "./MessageOptionsDropdown";

const MessageItem = ({ message, attachmentClick }) => {
    //  Guard against deleted or malformed messages
    if (!message || !message.id) return null;

    const currentUser = usePage().props.auth?.user;

    return (
        <div
            className={
                "chat" +
                (message.sender_id === currentUser?.id
                    ? " chat-end"
                    : " chat-start")
            }
        >
           
            {message.sender && <UserAvatar user={message.sender} />}

            <div className="chat-header">
                {message.sender_id !== currentUser?.id && message.sender?.name}
                <time className="text-xs opacity-50 ml-2">
                    {formatMessageDateLong(message.created_at)}
                </time>
            </div>

            <div
                className={
                    "chat-bubble relative" +
                    (message.sender_id === currentUser?.id
                        ? " chat-bubble-info"
                        : "")
                }
            >
                
                {message.sender_id === currentUser?.id && (
                    <MessageOptionsDropdown message={message} />
                )}

                <div className="chat-message">
                    <div className="chat-message-content">
                        {typeof message.message === "string" && (
                            <ReactMarkdown>{message.message}</ReactMarkdown>
                        )}
                    </div>

                    <MessageAttachments
                        attachments={Array.isArray(message.attachments) ? message.attachments : []}
                        attachmentClick={attachmentClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
