package com.hawkcards.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hawkcards.app.models.*
import com.hawkcards.app.repository.HawkRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {
    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private val _cards = MutableStateFlow<List<DigitalCard>>(emptyList())
    val cards: StateFlow<List<DigitalCard>> = _cards.asStateFlow()

    private val _contacts = MutableStateFlow<List<Contact>>(emptyList())
    val contacts: StateFlow<List<Contact>> = _contacts.asStateFlow()

    fun login(email: String, role: UserRole): Boolean {
        val user = HawkRepository.getUsers().find { it.email == email && it.role == role }
        return if (user != null) {
            _currentUser.value = user
            loadUserData()
            true
        } else {
            false
        }
    }

    fun logout() {
        _currentUser.value = null
        _cards.value = emptyList()
        _contacts.value = emptyList()
    }

    private fun loadUserData() {
        val user = _currentUser.value ?: return
        _cards.value = HawkRepository.getCards(user.id)
        _contacts.value = HawkRepository.getContacts(user.id)
    }

    fun addContact(name: String, email: String, phone: String) {
        val user = _currentUser.value ?: return
        val newContact = Contact(
            ownerId = user.id,
            name = name,
            email = email,
            phone = phone,
            addedAt = java.util.Date().toString()
        )
        HawkRepository.addContact(newContact)
        loadUserData()
    }

    fun deleteContact(contactId: String) {
        HawkRepository.deleteContact(contactId)
        loadUserData()
    }

    fun saveCard(card: DigitalCard) {
        HawkRepository.saveCard(card)
        loadUserData()
    }

    fun getCardById(cardId: String): DigitalCard? {
        return _cards.value.find { it.id == cardId }
    }
}
