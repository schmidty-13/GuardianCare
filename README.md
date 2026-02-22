## Team: AI'm Him

**Dylan Pellegrini · Liam Schmidt · Paul Chen · Trevor Cluté**

HackAI 2026

---

# GuardianCare
### Passive Wireless Fall Detection for Safer Independent Living

GuardianCare is a contact-free fall detection and patient monitoring system that uses WiFi Channel State Information (CSI) to detect falls, monitor breathing, and classify room occupancy — with no cameras, no wearables, and nothing required from the person being monitored.

---

## What It Does

GuardianCare continuously monitors a room by analyzing how a wireless signal changes as people move, breathe, and fall. Two ESP32 microcontrollers exchange packets via ESP-NOW. When a person's body disturbs the signal path between the boards, those disturbances are captured, filtered, and classified in real time.

The system detects three room states:
- **Empty** — No person present
- **Person Present** — Occupant detected, actively monitoring
- **Fall Detected** — Sudden fall event classified, alert triggered

When a fall is detected across multiple consecutive classification windows, a nurse or caregiver alert is issued immediately.

---

## Signal Processing Pipeline

Raw CSI data arrives at approximately 100 frames per second, each frame containing amplitude values across 52 subcarriers. Because raw CSI is inherently noisy, the pipeline applies two filtering stages before classification:

1. **Hampel Filter** — A sliding window filter using median and median absolute deviation (MAD) to remove impulsive spike outliers caused by packet corruption or environmental interference.
2. **Butterworth Low-Pass Filter** — Smooths residual noise while preserving the signal features that correspond to human movement and breathing. The maximally flat frequency response ensures amplitude readings are not distorted.

The cleaned signal is then fed into the classification model as sliding windows of time series data.

---

## Machine Learning Model

GuardianCare uses a 1D Convolutional Neural Network (1D-CNN) trained on three labeled datasets collected in a real environment:

- 10 minutes of empty room data
- 10 minutes of a person moving around the room
- 25 staged fall events

The 1D-CNN processes sliding windows of the 52-subcarrier CSI time series, learning temporal patterns that distinguish between occupancy states. To minimize false alarms, the system uses multi-window confidence thresholding — a fall alert is only triggered when the model predicts a fall with high confidence across three consecutive windows.

The model achieved **81.94% validation accuracy**, with perfect precision on empty room classification.

---

## Breathing Rate Monitoring

In addition to fall detection, GuardianCare estimates breathing rate in real time. High-variance subcarriers are selected from the CSI stream, as they carry the strongest respiratory signal. A bandpass filter isolates the respiratory frequency band, and an FFT identifies the dominant peak frequency, which is converted to breaths per minute (BPM).

The system maintains a rolling 10-minute baseline and flags breathing anomalies when the current BPM deviates significantly from that baseline for a sustained period.

---

## Live Dashboard

GuardianCare includes a real-time clinical monitoring dashboard that displays:

- **Patient Status Card** — Current system state (CLEAR, MONITORING, ALERT) with confidence score and room state label. Escalates to a prominent alert banner when a fall is detected.
- **CSI Subcarrier Amplitude Chart** — Time series of four tracked subcarriers, showing signal behavior over time. Fall events appear as clear spikes.
- **CSI Heatmap** — A 4×13 grid of all 52 subcarriers, with cell shading reflecting current amplitude. Provides an at-a-glance view of the full channel state.
- **Breathing Rate Chart** — Breaths per minute plotted over time with normal range reference lines (12–20 BPM).
- **Event Log** — Timestamped log of all system events including state transitions, alerts, and stream connection status.
- **System Meta Bar** — Live display of packet rate, signal strength, model version, detection latency, and connection status.

The dashboard features a collapsible clinical sidebar for navigation between monitoring, event log, system health, and settings views.

---

## Privacy

GuardianCare generates no images, no audio, and stores no personally identifiable information. It detects presence and movement patterns through radio signal analysis only. This makes it fundamentally different from camera-based systems and significantly simplifies privacy compliance in care settings.

---

## Impact

Falls are projected to cost the U.S. healthcare system over $101 billion by 2030 (NCOA). GuardianCare deploys on two ESP32 boards for approximately $20 in hardware per room — with zero cameras, zero wearables, and zero privacy concerns.

---

