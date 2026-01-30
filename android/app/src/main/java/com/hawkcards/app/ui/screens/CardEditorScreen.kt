@file:OptIn(ExperimentalMaterial3Api::class)
package com.hawkcards.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hawkcards.app.models.*

@Composable
fun CardEditorScreen(
    card: DigitalCard?,
    userId: String,
    onSave: (DigitalCard) -> Unit,
    onBack: () -> Unit
) {
    var title by remember { mutableStateOf(card?.title ?: "New Card") }
    var firstName by remember { mutableStateOf(card?.firstName ?: "") }
    var lastName by remember { mutableStateOf(card?.lastName ?: "") }
    var jobTitle by remember { mutableStateOf(card?.jobTitle ?: "") }
    var company by remember { mutableStateOf(card?.company ?: "") }
    var color by remember { mutableStateOf(card?.color ?: "#3b82f6") }
    var theme by remember { mutableStateOf(card?.theme ?: CardTheme.MODERN) }

    val fields = remember { mutableStateListOf<SocialField>().apply {
        if (card != null) addAll(card.fields)
    } }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (card == null) "Create Card" else "Edit Card") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    TextButton(onClick = {
                        val newCard = DigitalCard(
                            id = card?.id ?: "card-${System.currentTimeMillis()}",
                            userId = userId,
                            title = title,
                            firstName = firstName,
                            lastName = lastName,
                            jobTitle = jobTitle,
                            company = company,
                            color = color,
                            theme = theme,
                            fields = fields.toList(),
                            views = card?.views ?: 0,
                            saves = card?.saves ?: 0
                        )
                        onSave(newCard)
                    }) {
                        Text("Save", fontWeight = FontWeight.Bold)
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text("Appearance", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Card Title") }, modifier = Modifier.fillMaxWidth())

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Color: ")
                            Spacer(modifier = Modifier.width(8.dp))
                            val colors = listOf("#3b82f6", "#8b5cf6", "#ef4444", "#10b981", "#f59e0b", "#000000")
                            colors.forEach { hex ->
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(Color(android.graphics.Color.parseColor(hex)))
                                        .clickable { color = hex }
                                        .padding(if (color == hex) 4.dp else 0.dp)
                                        .let { if (color == hex) it.background(Color.White, CircleShape).padding(2.dp).background(Color(android.graphics.Color.parseColor(hex)), CircleShape) else it }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                            }
                        }
                    }
                }
            }

            item {
                Text("General Information", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = firstName, onValueChange = { firstName = it }, label = { Text("First Name") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = lastName, onValueChange = { lastName = it }, label = { Text("Last Name") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = jobTitle, onValueChange = { jobTitle = it }, label = { Text("Job Title") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = company, onValueChange = { company = it }, label = { Text("Company") }, modifier = Modifier.fillMaxWidth())
                    }
                }
            }

            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Fields", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    IconButton(onClick = { fields.add(SocialField(type = SocialFieldType.EMAIL, value = "")) }) {
                        Icon(Icons.Default.AddCircle, contentDescription = "Add Field")
                    }
                }
            }

            itemsIndexed(fields) { index, field ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            var expanded by remember { mutableStateOf(false) }
                            Box {
                                TextButton(onClick = { expanded = true }) {
                                    Text(field.type.name)
                                    Icon(Icons.Default.ArrowDropDown, null)
                                }
                                DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                                    SocialFieldType.values().forEach { type ->
                                        DropdownMenuItem(
                                            text = { Text(type.name) },
                                            onClick = {
                                                fields[index] = field.copy(type = type)
                                                expanded = false
                                            }
                                        )
                                    }
                                }
                            }
                            OutlinedTextField(
                                value = field.value,
                                onValueChange = { fields[index] = field.copy(value = it) },
                                label = { Text("Value") },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                        IconButton(onClick = { fields.removeAt(index) }) {
                            Icon(Icons.Default.Delete, contentDescription = "Remove")
                        }
                    }
                }
            }
        }
    }
}
