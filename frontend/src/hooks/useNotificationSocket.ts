import { useEffect, useRef } from 'react'
import { Client, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '@/store/authStore'
import type { NotificationItem } from '@/api/notificationApi'
import { WS_BASE_URL } from '@/config/env'

export function useNotificationSocket(
    onNotification: (notification: NotificationItem) => void
) {
    const { accessToken, isAuthenticated } = useAuthStore()
    const callbackRef = useRef(onNotification)

    useEffect(() => {
        callbackRef.current = onNotification
    }, [onNotification])

    useEffect(() => {
        if (!isAuthenticated || !accessToken) return

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_BASE_URL),
            connectHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: () => undefined,
        })

        client.onConnect = () => {
            client.subscribe('/user/queue/notifications', (message: IMessage) => {
                try {
                    const payload = JSON.parse(message.body) as NotificationItem
                    callbackRef.current(payload)
                } catch {
                    // Bỏ qua payload không hợp lệ.
                }
            })
        }

        client.activate()

        return () => {
            client.deactivate()
        }
    }, [accessToken, isAuthenticated])
}
