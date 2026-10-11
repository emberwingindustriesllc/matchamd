package com.example.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.example.data.model.BillingType
import com.example.data.model.StripeCatalog
import com.example.data.model.StripePaymentTransaction
import com.example.data.model.StripeProduct
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

data class StripeAccountConfig(
    val publishableKey: String = "pk_test_matchamd_demo_51NABC",
    val isBankAccountLinked: Boolean = true,
    val bankAccountName: String = "Online Bank Account (Linked to Stripe)",
    val payoutSchedule: String = "Daily rolling payouts via Stripe Express",
    val customPaymentLinks: Map<String, String> = emptyMap(),
    val isLiveMode: Boolean = false
)

class StripeRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("matcha_stripe_prefs", Context.MODE_PRIVATE)

    private val _config = MutableStateFlow(loadConfig())
    val config: StateFlow<StripeAccountConfig> = _config.asStateFlow()

    private val _transactions = MutableStateFlow(loadTransactions())
    val transactions: StateFlow<List<StripePaymentTransaction>> = _transactions.asStateFlow()

    private fun loadConfig(): StripeAccountConfig {
        val pk = prefs.getString("pk_key", "pk_test_matchamd_demo_51NABC") ?: "pk_test_matchamd_demo_51NABC"
        val isLive = prefs.getBoolean("is_live", false)
        val bankLinked = prefs.getBoolean("bank_linked", true)

        val linksMap = mutableMapOf<String, String>()
        StripeCatalog.ALL_PRODUCTS.forEach { prod ->
            val savedLink = prefs.getString("link_${prod.id}", null)
            if (!savedLink.isNullOrBlank()) {
                linksMap[prod.id] = savedLink
            }
        }

        return StripeAccountConfig(
            publishableKey = pk,
            isBankAccountLinked = bankLinked,
            isLiveMode = isLive,
            customPaymentLinks = linksMap
        )
    }

    fun updatePublishableKey(key: String, isLive: Boolean) {
        prefs.edit()
            .putString("pk_key", key)
            .putBoolean("is_live", isLive)
            .apply()
        _config.update { it.copy(publishableKey = key, isLiveMode = isLive) }
    }

    fun setCustomPaymentLink(productId: String, linkUrl: String) {
        prefs.edit().putString("link_$productId", linkUrl).apply()
        _config.update { current ->
            val updated = current.customPaymentLinks.toMutableMap()
            if (linkUrl.isBlank()) {
                updated.remove(productId)
            } else {
                updated[productId] = linkUrl
            }
            current.copy(customPaymentLinks = updated)
        }
    }

    private fun loadTransactions(): List<StripePaymentTransaction> {
        val json = prefs.getString("transactions_json", null) ?: return emptyList()
        return try {
            val arr = JSONArray(json)
            val list = mutableListOf<StripePaymentTransaction>()
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                list.add(
                    StripePaymentTransaction(
                        transactionId = obj.getString("transactionId"),
                        productId = obj.getString("productId"),
                        productName = obj.getString("productName"),
                        amountFormatted = obj.getString("amountFormatted"),
                        amountCents = obj.getLong("amountCents"),
                        customerEmail = obj.getString("customerEmail"),
                        customerName = obj.getString("customerName"),
                        specialty = obj.getString("specialty"),
                        notes = obj.optString("notes", ""),
                        cardLast4 = obj.getString("cardLast4"),
                        cardBrand = obj.getString("cardBrand"),
                        status = obj.getString("status"),
                        timestamp = obj.getLong("timestamp"),
                        stripeReceiptUrl = obj.optString("stripeReceiptUrl", "")
                    )
                )
            }
            list
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun saveTransactions(list: List<StripePaymentTransaction>) {
        val arr = JSONArray()
        list.forEach { tx ->
            val obj = JSONObject().apply {
                put("transactionId", tx.transactionId)
                put("productId", tx.productId)
                put("productName", tx.productName)
                put("amountFormatted", tx.amountFormatted)
                put("amountCents", tx.amountCents)
                put("customerEmail", tx.customerEmail)
                put("customerName", tx.customerName)
                put("specialty", tx.specialty)
                put("notes", tx.notes)
                put("cardLast4", tx.cardLast4)
                put("cardBrand", tx.cardBrand)
                put("status", tx.status)
                put("timestamp", tx.timestamp)
                put("stripeReceiptUrl", tx.stripeReceiptUrl)
            }
            arr.put(obj)
        }
        prefs.edit().putString("transactions_json", arr.toString()).apply()
        _transactions.value = list
    }

    fun recordSuccessfulPayment(
        product: StripeProduct,
        customerEmail: String,
        customerName: String,
        specialty: String,
        notes: String,
        cardLast4: String,
        cardBrand: String
    ): StripePaymentTransaction {
        val randomSuffix = UUID.randomUUID().toString().take(12).replace("-", "")
        val txId = "pi_3M" + randomSuffix
        val tx = StripePaymentTransaction(
            transactionId = txId,
            productId = product.id,
            productName = product.name,
            amountFormatted = product.formattedPrice,
            amountCents = product.amountCents,
            customerEmail = customerEmail,
            customerName = customerName,
            specialty = specialty,
            notes = notes,
            cardLast4 = cardLast4,
            cardBrand = cardBrand,
            status = "succeeded",
            timestamp = System.currentTimeMillis(),
            stripeReceiptUrl = "https://dashboard.stripe.com/test/payments/$txId"
        )
        val updated = listOf(tx) + _transactions.value
        saveTransactions(updated)
        return tx
    }
}
