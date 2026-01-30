package com.hawkcards.app.repository

import com.hawkcards.app.models.*
import java.util.*

object HawkRepository {
    private var users = mutableListOf<User>(
        User(
            id = "admin-1",
            name = "Sarah Connor",
            email = "admin@hawkforce.ai",
            role = UserRole.ADMIN,
            position = "Chief Security Officer",
            department = "Security",
            phone = "+1 (555) 010-9988",
            cardStatus = CardStatus.ACTIVE,
            avatarUrl = "https://picsum.photos/200/200?random=1",
            issuedAt = Date().toString()
        ),
        User(
            id = "user-1",
            name = "John Anderson",
            email = "john.anderson@hawkforce.ai",
            role = UserRole.USER,
            position = "Software Engineer",
            department = "Engineering",
            phone = "+1 (555) 019-2233",
            cardStatus = CardStatus.ACTIVE,
            avatarUrl = "https://picsum.photos/200/200?random=2",
            issuedAt = Date().toString()
        )
    )

    private var contacts = mutableListOf<Contact>(
        Contact(
            id = "c-1",
            ownerId = "user-1",
            name = "Thomas Mueller",
            email = "thomas.m@example.com",
            phone = "491522334455",
            addedAt = Date(System.currentTimeMillis() - 604800000).toString(),
            lastMeeting = Date(System.currentTimeMillis() - 86400000).toString(),
            notes = "Interested in enterprise security stack. Follow up next Tuesday.",
            avatarUrl = "https://picsum.photos/200/200?random=10",
            linkedin = "https://linkedin.com/in/thomasmueller",
            tag = "Work"
        ),
        Contact(
            id = "c-2",
            ownerId = "user-1",
            name = "Emily Watson",
            email = "emily.w@techcorp.com",
            phone = "15550123456",
            addedAt = Date(System.currentTimeMillis() - 1209600000).toString(),
            lastMeeting = Date(System.currentTimeMillis() - 432000000).toString(),
            notes = "Discussed potential partnership for Q3. Needs demo.",
            avatarUrl = "https://picsum.photos/200/200?random=11",
            linkedin = "https://linkedin.com/in/emilywatson",
            tag = "VIP"
        )
    )

    private var segments = mutableListOf<ContactSegment>(
        ContactSegment(id = "seg-1", ownerId = "user-1", name = "Work", color = "#3b82f6", description = "Business contacts and clients"),
        ContactSegment(id = "seg-2", ownerId = "user-1", name = "VIP", color = "#8b5cf6", description = "Key decision makers")
    )

    private var templates = mutableListOf<MessageTemplate>(
        MessageTemplate(id = "tm-1", ownerId = "user-1", title = "New Year Greeting", category = TemplateCategory.HOLIDAY, content = "Happy New Year! Wishing you a prosperous year ahead filled with success and joy."),
        MessageTemplate(id = "tm-2", ownerId = "user-1", title = "Follow-up", category = TemplateCategory.FOLLOW_UP, content = "Hi! It was great connecting with you recently. Would love to catch up and discuss our potential collaboration further.")
    )

    private var cards = mutableListOf<DigitalCard>(
        DigitalCard(
            id = "card-1",
            userId = "user-1",
            title = "Work",
            theme = CardTheme.MODERN,
            color = "#3b82f6",
            firstName = "John",
            lastName = "Anderson",
            jobTitle = "Software Engineer",
            company = "Hawkforce AI",
            department = "Engineering",
            fields = listOf(
                SocialField(id = "f1", type = SocialFieldType.EMAIL, value = "john.anderson@hawkforce.ai", label = "Work Email"),
                SocialField(id = "f2", type = SocialFieldType.PHONE, value = "+1 (555) 019-2233", label = "Work Phone")
            ),
            avatarUrl = "https://picsum.photos/200/200?random=2",
            views = 120,
            uniqueViews = 85,
            saves = 12
        )
    )

    private var logs = mutableListOf<LogEntry>(
        LogEntry(id = "log-1", action = "SYSTEM_INIT", details = "System initialized", timestamp = Date(System.currentTimeMillis() - 10000000).toString())
    )

    fun getUsers(): List<User> = users

    fun addUser(user: User) {
        users.add(0, user)
        addLog("USER_CREATE", "Admin created user profile for ${user.name}")
    }

    fun getLogs(): List<LogEntry> = logs

    fun addLog(action: String, details: String) {
        logs.add(0, LogEntry(action = action, details = details, timestamp = Date().toString()))
    }

    fun getCards(userId: String): List<DigitalCard> = cards.filter { it.userId == userId }

    fun saveCard(card: DigitalCard) {
        val index = cards.indexOfFirst { it.id == card.id }
        if (index >= 0) cards[index] = card
        else cards.add(card)
    }

    fun getContacts(userId: String): List<Contact> = contacts.filter { it.ownerId == userId }

    fun addContact(contact: Contact) {
        contacts.add(0, contact)
    }

    fun updateContact(updatedContact: Contact) {
        val index = contacts.indexOfFirst { it.id == updatedContact.id }
        if (index >= 0) contacts[index] = updatedContact
    }

    fun deleteContact(contactId: String) {
        contacts.removeAll { it.id == contactId }
    }

    fun getSegments(userId: String): List<ContactSegment> = segments.filter { it.ownerId == userId }

    fun saveSegment(segment: ContactSegment) {
        segments.add(segment)
    }

    fun getTemplates(userId: String): List<MessageTemplate> = templates.filter { it.ownerId == userId }

    fun saveTemplate(template: MessageTemplate) {
        templates.add(template)
    }
}
