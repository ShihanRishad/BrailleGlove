import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scanSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#050611ff',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonDisabled: {
    backgroundColor: '#A0CAFF',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  deviceId: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#ADB5BD',
    marginTop: 16,
    fontSize: 16,
  },
  controlPanel: {
    paddingHorizontal: 24,
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  disconnectText: {
    color: '#FF5252',
    fontWeight: '600',
  },
  input: {
    height: 60,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#212529',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  sendButton: {
    backgroundColor: '#28A745',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  hint: {
    textAlign: 'center',
    marginTop: 16,
    color: '#ADB5BD',
    fontSize: 13,
    lineHeight: 18,
  },
});

export const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
  },
  title: {
    color: '#FFFFFF',
  },
  scanButton: {
    backgroundColor: '#FFFFFF',
  },
  scanButtonText: {
    color: '#121212',
  },
  deviceCard: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2C2C2E',
  },
  deviceName: {
    color: '#E5E5EA',
  },
  deviceId: {
    color: '#8E8E93',
  },
  emptyText: {
    color: '#8E8E93',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2C2C2E',
  },
  cardTitle: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    borderColor: '#3A3A3C',
  },
  disabledButton: {
    backgroundColor: '#2E7D32',
    opacity: 0.6,
  },
  hint: {
    color: '#8E8E93',
  },
});
