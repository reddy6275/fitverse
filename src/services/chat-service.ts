import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { ChatMessage } from '@/types/user-profile';

/**
 * Save a chat message to Firestore
 */
export async function saveChatMessage(
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: ChatMessage['metadata']
): Promise<void> {
    try {
        const messagesRef = collection(db, 'chatHistory', userId, 'messages');

        await addDoc(messagesRef, {
            role,
            content,
            metadata: metadata || {},
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error saving chat message:', error);
    }
}

/**
 * Get recent chat history for a user
 */
export async function getChatHistory(
    userId: string,
    messageLimit: number = 10
): Promise<ChatMessage[]> {
    try {
        const messagesRef = collection(db, 'chatHistory', userId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(messageLimit));

        const querySnapshot = await getDocs(q);
        const messages: ChatMessage[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                userId,
                role: data.role,
                content: data.content,
                timestamp: data.timestamp?.toDate() || new Date(),
                metadata: data.metadata,
            });
        });

        // Return in chronological order (oldest first)
        return messages.reverse();
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
}

/**
 * Build chat context string for AI prompt
 */
export function buildChatContext(messages: ChatMessage[]): string {
    if (messages.length === 0) {
        return 'No previous conversation.';
    }

    return messages
        .map((msg) => {
            const role = msg.role === 'user' ? 'User' : 'Coach';
            return `${role}: ${msg.content}`;
        })
        .join('\n');
}
