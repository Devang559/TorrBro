package com.torrbro

import android.os.Environment
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.libtorrent4j.AlertListener
import org.libtorrent4j.SessionManager
import org.libtorrent4j.TorrentHandle
import org.libtorrent4j.alerts.AddTorrentAlert
import org.libtorrent4j.alerts.Alert
import org.libtorrent4j.swig.torrent_flags_t
import java.io.File
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

class TorrentDownloadModule(
  private val context: ReactApplicationContext,
) : ReactContextBaseJavaModule(context) {
  private val sessionManager = SessionManager()
  private val handles = ConcurrentHashMap<String, TorrentHandle>()
  private val titles = ConcurrentHashMap<String, String>()
  private val pausedIds = ConcurrentHashMap.newKeySet<String>()
  private val executor = Executors.newSingleThreadExecutor()
  private val handler = Handler(Looper.getMainLooper())
  private val downloadDirectory = File(
    context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: context.filesDir,
    "TorrBro",
  )
  @Volatile private var sessionStarted = false

  private val alertListener = object : AlertListener {
    override fun types(): IntArray? = null

    override fun alert(alert: Alert<*>) {
      if (alert is AddTorrentAlert) {
        val handle = alert.handle()
        val id = handle.infoHash().toHex().lowercase(Locale.US)
        handles[id] = handle
        titles.putIfAbsent(id, handle.status().name())
        emitDownloads()
      }
    }
  }

  private val statusUpdater = object : Runnable {
    override fun run() {
      emitDownloads()
      handler.postDelayed(this, 1000)
    }
  }

  override fun getName() = "TorrentDownloadManager"

  init {
    downloadDirectory.mkdirs()
    sessionManager.addListener(alertListener)
    startSession()
    handler.post(statusUpdater)
  }

  private fun startSession() {
    if (sessionStarted) return
    sessionManager.start()
    sessionManager.maxConnections(500)
    sessionManager.maxActiveDownloads(5)
    sessionManager.maxActiveSeeds(5)
    sessionManager.downloadRateLimit(0)
    sessionManager.uploadRateLimit(0)
    sessionStarted = true
  }

  @ReactMethod
  fun addTorrent(title: String, magnet: String, promise: Promise) {
    executor.execute {
      try {
        require(magnet.startsWith("magnet:?", ignoreCase = true)) {
          "This result does not contain a valid magnet link."
        }
        startSession()
        val parsed = org.libtorrent4j.AddTorrentParams.parseMagnetUri(magnet)
        val hash = parsed.getInfoHashes().getBest().toHex().lowercase(Locale.US)
        require(hash.isNotBlank()) { "The magnet link does not contain a torrent hash." }
        if (handles.containsKey(hash)) {
          promise.reject("TORRENT_ALREADY_ADDED", "This torrent is already in Downloads.")
          return@execute
        }
        titles[hash] = title
        sessionManager.download(magnet, downloadDirectory, torrent_flags_t())
        promise.resolve(hash)
      } catch (error: Exception) {
        promise.reject("TORRENT_ADD_FAILED", error.message ?: "Unable to start this torrent.", error)
      }
    }
  }

  @ReactMethod
  fun getDownloads(promise: Promise) {
    promise.resolve(downloadsArray())
  }

  @ReactMethod
  fun pauseTorrent(id: String, promise: Promise) {
    withHandle(id, promise) {
      it.pause()
      pausedIds.add(id)
    }
  }

  @ReactMethod
  fun resumeTorrent(id: String, promise: Promise) {
    withHandle(id, promise) {
      it.resume()
      pausedIds.remove(id)
    }
  }

  @ReactMethod
  fun removeTorrent(id: String, promise: Promise) {
    withHandle(id, promise) { handle ->
      sessionManager.remove(handle)
      handles.remove(id)
      titles.remove(id)
      pausedIds.remove(id)
    }
  }

  private fun withHandle(id: String, promise: Promise, operation: (TorrentHandle) -> Unit) {
    executor.execute {
      try {
        val handle = handles[id] ?: throw IllegalArgumentException("Torrent not found.")
        operation(handle)
        promise.resolve(null)
      } catch (error: Exception) {
        promise.reject("TORRENT_ACTION_FAILED", error.message ?: "Unable to update this torrent.", error)
      }
    }
  }

  private fun downloadsArray() = Arguments.createArray().also { result ->
    handles.forEach { (id, handle) ->
      if (handle.isValid) {
        val status = handle.status()
        result.pushMap(Arguments.createMap().apply {
          putString("id", id)
          putString("title", titles[id]?.takeIf(String::isNotBlank) ?: status.name())
          putDouble("progress", (status.progress() * 100).toDouble())
          putString(
            "status",
            when {
              pausedIds.contains(id) -> "Paused"
              status.isFinished() -> "Seeding"
              else -> "Downloading"
            },
          )
          putDouble("speedBytesPerSecond", status.downloadRate().toDouble())
          putDouble("downloadedBytes", status.totalWantedDone().toDouble())
          putDouble("totalBytes", status.totalWanted().toDouble())
          putInt("peers", status.numPeers())
          putInt("seeds", status.numSeeds())
          putString("savePath", downloadDirectory.absolutePath)
        })
      }
    }
  }

  private fun emitDownloads() {
    if (!context.hasActiveCatalystInstance()) return
    context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("torrentDownloadsUpdated", downloadsArray())
  }

  @ReactMethod
  fun addListener(eventName: String) = Unit

  @ReactMethod
  fun removeListeners(count: Int) = Unit

  override fun invalidate() {
    handler.removeCallbacks(statusUpdater)
    sessionManager.removeListener(alertListener)
    executor.execute { sessionManager.stop() }
    executor.shutdown()
    super.invalidate()
  }
}
