import ConversationItem from "@/Components/App/ConversationItem";
import GroupModal from "@/Components/App/GroupModal";
import TextInput from "@/Components/TextInput";
import { useEventBus } from "@/EventBus";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

const ChatLayout = ({ children }) => {
   const page = usePage();
   const conversations = page.props.conversations;
   const selectedConversation = page.props.selectedConversation;
   const [localConversations, setLocalConversations] = useState([]);
   const [sortedConversations, setSortedConversations] = useState([]);
   const [onlineUsers, setOnlineUsers] = useState({});
   const [showGroupModal, setShowGroupModal] = useState(false);
   const { emit, on } = useEventBus();

   const isUserOnline = (userId) => onlineUsers[userId];

   const onSearch = (ev) => {
      const search = ev.target.value.toLowerCase();
      setLocalConversations(
         conversations.filter((conversation) => {
            return conversation.name.toLowerCase().includes(search);
         })
      );
   };

   const messageCreated = (message) => {
      setLocalConversations((oldUsers) => {
         return oldUsers.map((u) => {
            if (
               message.receiver_id &&
               !u.is_group &&
               (u.id == message.sender_id || u.id == message.receiver_id)
            ) {
               u.last_message = message.message || "[Attachment]";
               u.last_message_date = message.created_at;
               return u;
            }

            if (
               message.group_id &&
               u.is_group &&
               u.id == message.group_id
            ) {
               u.last_message = message.message || "[Attachment]";
               u.last_message_date = message.created_at;
               return u;
            }
            return u;
         });
      });
   };

   const messageDeleted = ({ prevMessage }) => {

      if (!prevMessage) {
         return;
      }
      messageCreated(prevMessage)
   }
   useEffect(() => {
      const offCreated = on("message.created", messageCreated);
      const offDeleted = on("message.deleted", messageDeleted);
      const offModalShow = on("GroupModal.show", (group) => {
         setShowGroupModal(true);
      });

      const offGroupDelete = on("group.deleted", ({ id, name }) => {
         setLocalConversations((oldConversations) => {
            return oldConversations.filter((con) => con.id !== id);
         });

         emit("toast.show", `Group "${name}" was deleted`);

         if (
            !selectedConversation ||
            (selectedConversation.is_group && selectedConversation.id === id)
         ) {
            router.visit(route("dashboard"));
         }
      });

      return () => {
         offCreated();
         offDeleted();
         offModalShow();
         offGroupDelete();
      };
   }, [on]);

   useEffect(() => {
      setSortedConversations(
         [...localConversations].sort((a, b) => { // ✅ clone before sort
            if (a.blocked_at && b.blocked_at) {
               return new Date(b.blocked_at) - new Date(a.blocked_at);
            } else if (a.blocked_at) {
               return 1;
            } else if (b.blocked_at) {
               return -1;
            }

            if (a.last_message_date && b.last_message_date) {
               return b.last_message_date.localeCompare(a.last_message_date);
            } else if (a.last_message_date) {
               return -1;
            } else if (b.last_message_date) {
               return 1;
            } else {
               return 0;
            }
         })
      );
   }, [localConversations]);

   useEffect(() => {
      setLocalConversations((prev) => {
         const updated = conversations.map((convo) => {
            const local = prev.find(
               (c) => c.id === convo.id && c.is_group === convo.is_group
            );

            // Use local version if it has a newer message
            if (
               local &&
               new Date(local.last_message_date) > new Date(convo.last_message_date || 0)
            ) {
               return local;
            }

            return convo;
         });

         return updated;
      });
   }, [conversations]);

   useEffect(() => {
      const echo = window.Echo;

      if (echo && echo.join) {
         echo
            .join("online")
            .here((users) => {
               const onlineUsersObj = Object.fromEntries(
                  users.map((user) => [user.id, user])
               );
               setOnlineUsers((prevOnlineUsers) => {
                  return { ...prevOnlineUsers, ...onlineUsersObj };
               });
            })
            .joining((user) => {
               setOnlineUsers((prevOnlineUsers) => {
                  const updatedUsers = { ...prevOnlineUsers };
                  updatedUsers[user.id] = user;
                  return updatedUsers;
               });
            })
            .leaving((user) => {
               setOnlineUsers((prevOnlineUsers) => {
                  const updatedUsers = { ...prevOnlineUsers };
                  delete updatedUsers[user.id];
                  return updatedUsers;
               });
            })
            .error((error) => {
               console.error("error", error);
            });

         return () => {
            echo.leave("online");
         };
      } else {
         console.warn("Echo is not initialized or join is undefined");
      }
   }, []);

   return (
      <>
         <div className="flex-1 w-full flex overflow-hidden">
            <div
               className={`transition-all w-full sm:w-[220px] md:w-[300px] bg-slate-800 
        flex flex-col overflow-hidden ${selectedConversation ? "-ml-[100%] sm:ml-0" : ""}`}
            >
               <div className="flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200">
                  My Conversations
                  <div className="tooltip tooltip-left" data-tip="Create new Group">
                     <button onClick={(ev) => setShowGroupModal(true)}
                        className="text-gray-400 hover:text-gray-200">
                        <PencilSquareIcon className="w-4 h-4 inline-block ml-2" />
                     </button>
                  </div>
               </div>
               <div className="p-3">
                  <TextInput
                     onKeyUp={onSearch}
                     placeholder="Filter users and groups"
                     className="w-full"
                  />
               </div>
               <div className="flex-1 overflow-auto">
                  {sortedConversations &&
                     sortedConversations.map((conversation) => (
                        <ConversationItem
                           key={`${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
                           conversation={conversation}
                           online={!!isUserOnline(conversation.id)}
                        />
                     ))}
               </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
         </div>
         <GroupModal show={showGroupModal}
            onClose={() => setShowGroupModal(false)}
         />
      </>
   );
};

export default ChatLayout;
