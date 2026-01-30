package com.hawkcards.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.hawkcards.app.ui.screens.DashboardScreen
import com.hawkcards.app.ui.screens.LoginScreen
import com.hawkcards.app.ui.screens.ContactsScreen
import com.hawkcards.app.ui.theme.HawkcardsTheme
import com.hawkcards.app.viewmodels.MainViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            HawkcardsTheme {
                val navController = rememberNavController()
                val viewModel: MainViewModel = viewModel()
                val currentUser by viewModel.currentUser.collectAsState()
                val cards by viewModel.cards.collectAsState()
                val contacts by viewModel.contacts.collectAsState()

                NavHost(navController = navController, startDestination = "login") {
                    composable("login") {
                        LoginScreen(onLogin = { email, role ->
                            if (viewModel.login(email, role)) {
                                navController.navigate("dashboard") {
                                    popUpTo("login") { inclusive = true }
                                }
                            }
                        })
                    }
                    composable("dashboard") {
                        DashboardScreen(
                            cards = cards,
                            onLogout = {
                                viewModel.logout()
                                navController.navigate("login") {
                                    popUpTo("dashboard") { inclusive = true }
                                }
                            },
                            onNavigateToContacts = {
                                navController.navigate("contacts")
                            }
                        )
                    }
                    composable("contacts") {
                        ContactsScreen(
                            contacts = contacts,
                            onBack = { navController.popBackStack() },
                            onDeleteContact = { viewModel.deleteContact(it) }
                        )
                    }
                }
            }
        }
    }
}
