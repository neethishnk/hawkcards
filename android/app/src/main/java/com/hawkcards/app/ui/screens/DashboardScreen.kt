package com.hawkcards.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hawkcards.app.models.DigitalCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    cards: List<DigitalCard>,
    onLogout: () -> Unit,
    onNavigateToContacts: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Cards", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = onNavigateToContacts) {
                        Icon(Icons.Default.AccountBox, contentDescription = "Contacts")
                    }
                    IconButton(onClick = onLogout) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Logout")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { /* Create Card */ }) {
                Icon(Icons.Default.Add, contentDescription = "Add Card")
            }
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
                StatsRow(cards)
            }

            items(cards) { card ->
                CardItem(card)
            }
        }
    }
}

@Composable
fun StatsRow(cards: List<DigitalCard>) {
    val totalViews = cards.sumOf { it.views }
    val totalSaves = cards.sumOf { it.saves }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        StatCard("Views", totalViews.toString(), Modifier.weight(1f), Color(0xFFF3E8FF), Color(0xFF9333EA))
        StatCard("Saves", totalSaves.toString(), Modifier.weight(1f), Color(0xFFECFDF5), Color(0xFF059669))
    }
}

@Composable
fun StatCard(label: String, value: String, modifier: Modifier, bgColor: Color, textColor: Color) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = bgColor),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = textColor.copy(alpha = 0.7f))
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Black, color = textColor)
        }
    }
}

@Composable
fun CardItem(card: DigitalCard) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
                    .background(Color(android.graphics.Color.parseColor(card.color)))
            )

            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(Color.LightGray)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("${card.firstName} ${card.lastName}", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("${card.jobTitle} @ ${card.company}", fontSize = 14.sp, color = Color.Gray)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Divider()

                Spacer(modifier = Modifier.height(12.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Info, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.Gray)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(card.views.toString(), fontSize = 12.sp, color = Color.Gray)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.Gray)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(card.saves.toString(), fontSize = 12.sp, color = Color.Gray)
                    }
                }
            }
        }
    }
}
