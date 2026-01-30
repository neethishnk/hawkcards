package com.hawkcards.app.models

import java.util.UUID

enum class UserRole {
    ADMIN, USER
}

enum class CardStatus {
    NOT_ISSUED, ACTIVE, REVOKED
}

data class User(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val email: String,
    val role: UserRole,
    val position: String,
    val department: String,
    val phone: String,
    val cardStatus: CardStatus,
    val avatarUrl: String? = null,
    val issuedAt: String? = null
)

data class Contact(
    val id: String = UUID.randomUUID().toString(),
    val ownerId: String,
    val name: String,
    val email: String,
    val phone: String,
    val addedAt: String,
    val lastMeeting: String? = null,
    val notes: String? = null,
    val avatarUrl: String? = null,
    val linkedin: String? = null,
    val twitter: String? = null,
    val tag: String? = null
)

data class ContactSegment(
    val id: String = UUID.randomUUID().toString(),
    val ownerId: String,
    val name: String,
    val description: String? = null,
    val color: String
)

data class MessageTemplate(
    val id: String = UUID.randomUUID().toString(),
    val ownerId: String,
    val title: String,
    val content: String,
    val category: TemplateCategory
)

enum class TemplateCategory {
    GREETING, FOLLOW_UP, HOLIDAY, CUSTOM
}

data class LogEntry(
    val id: String = UUID.randomUUID().toString(),
    val action: String,
    val details: String,
    val timestamp: String,
    val adminId: String? = null
)

enum class CardTheme {
    CLASSIC, MODERN, SLEEK, FLAT
}

enum class SocialFieldType {
    EMAIL, PHONE, WEBSITE, LINKEDIN, TWITTER, INSTAGRAM, GITHUB, YOUTUBE, CUSTOM
}

data class SocialField(
    val id: String = UUID.randomUUID().toString(),
    val type: SocialFieldType,
    val label: String? = null,
    val value: String
)

data class DigitalCard(
    val id: String = UUID.randomUUID().toString(),
    val userId: String,
    val title: String,
    val theme: CardTheme,
    val color: String,
    val prefix: String? = null,
    val firstName: String,
    val middleName: String? = null,
    val lastName: String,
    val suffix: String? = null,
    val preferredName: String? = null,
    val maidenName: String? = null,
    val pronouns: String? = null,
    val jobTitle: String,
    val department: String? = null,
    val company: String,
    val headline: String? = null,
    val fields: List<SocialField> = emptyList(),
    val avatarUrl: String? = null,
    val coverImageUrl: String? = null,
    val views: Int = 0,
    val uniqueViews: Int = 0,
    val saves: Int = 0
)
