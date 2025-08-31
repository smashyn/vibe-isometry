import { RoomManager } from '../../gameLogic/roomManager';
import { allClients } from '../WSMessageHandler';

export function handleAddChatMessage(
    send: (msg: any) => void,
    data: { type: 'add_chat_message'; roomId: string; text: string },
    sender: string,
) {
    if (!data.roomId || typeof data.text !== 'string' || !data.text.trim()) {
        send({ type: 'error', message: 'Invalid chat message' });
        return;
    }

    // Додаємо повідомлення до чату кімнати
    const ok = RoomManager.addChatMessage(data.roomId, sender, data.text.trim());
    if (!ok) {
        send({ type: 'error', message: 'Room not found' });
        return;
    }

    // Отримуємо повідомлення для broadcast
    const msg = {
        type: 'chat_message',
        roomId: data.roomId,
        sender,
        text: data.text.trim(),
        timestamp: Date.now(),
    };

    // Відправляємо всім клієнтам, які знаходяться у цій кімнаті
    for (const ws of allClients) {
        if (ws.username && RoomManager.getRoom(data.roomId)?.players.includes(ws.username)) {
            try {
                ws.send(JSON.stringify(msg));
            } catch {}
        }
    }
}
