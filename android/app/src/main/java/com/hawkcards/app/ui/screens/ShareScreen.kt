@file:OptIn(ExperimentalMaterial3Api::class)
package com.hawkcards.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Wallet
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hawkcards.app.models.DigitalCard
import com.hawkcards.app.ui.components.QRCodeImage

@Composable
fun ShareScreen(
    card: DigitalCard,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val cardUrl = "https://hawkforce.ai/c/${card.id}"

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Share Card") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Text(
                text = "${card.firstName} ${card.lastName}",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "${card.jobTitle} @ ${card.company}",
                fontSize = 16.sp,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(12.dp))

            Surface(
                tonalElevation = 4.dp,
                shape = MaterialTheme.shapes.large,
                modifier = Modifier.padding(16.dp)
            ) {
                Box(modifier = Modifier.padding(16.dp)) {
                    QRCodeImage(content = cardUrl, sizeDp = 240)
                }
            }

            Text(
                text = "Scan this code to view my digital card",
                fontSize = 14.sp,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = {
                    val sendIntent: Intent = Intent().apply {
                        action = Intent.ACTION_SEND
                        putExtra(Intent.EXTRA_TEXT, "Check out my digital business card: $cardUrl")
                        type = "text/plain"
                    }
                    val shareIntent = Intent.createChooser(sendIntent, null)
                    context.startActivity(shareIntent)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Share, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Share Link")
            }

            Button(
                onClick = {
                    // Actual Wallet integration requires a signed JWT from a server.
                    // Here we show a fallback/instructional action or a link to the web version
                    // which can handle the "Add to Wallet" flow.
                    val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(cardUrl))
                    context.startActivity(browserIntent)
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Black),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Wallet, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Add to Google Wallet", color = Color.White)
            }
        }
    }
}
