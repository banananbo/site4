import React from 'react';
import ConversationCreateForm from '../components/Conversation/ConversationCreateForm';
import ConversationList from '../components/Conversation/ConversationList';

const ConversationPage = () => {
  return (
    <div className="conversation-page">
      <h1>会話</h1>
      <ConversationCreateForm />
      <hr />
      <ConversationList />
    </div>
  );
};

export default ConversationPage; 