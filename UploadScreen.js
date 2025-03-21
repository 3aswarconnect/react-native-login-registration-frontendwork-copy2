import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator, StatusBar, Modal, FlatList, SafeAreaView, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const UploadScreen = () => {
  const route = useRoute();
  const userId = route.params?.userId || '';
  const [category, setCategory] = useState('Education');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState(null);
  const [docfile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = ['Entertainment','Education', 'Technology', 'Travel', 'Food', 'Fitness', 'Music', 'Comedy', 'Motivation', 'Fashion', 'News'];

  const pickFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: ['video/*', 'image/*'],
    });

    if (!result.canceled) {
      let selectedFile = result.assets[0];

      if (selectedFile.size > 100 * 1024 * 1024) {
        Alert.alert('File too large', 'Please select a media file smaller than 100MB.');
        return;
      }

      setFile(selectedFile);
    }
  };

  const pickDocFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    });

    if (!result.canceled) {
      let selectedFile = result.assets[0];

      if (selectedFile.size > 10 * 1024 * 1024) {
        Alert.alert('File too large', 'Please select a document file smaller than 10MB.');
        return;
      }

      setDocFile(selectedFile);
    }
  };

  const uploadToServer = async () => {
    if (!file) {
      Alert.alert('Error', 'Please select a media file.');
      return;
    }
  
    setUploading(true);
  
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('isPublic', isPublic ? 'true' : 'false');
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    });
  
    if (docfile) {
      formData.append('docfile', {
        uri: docfile.uri,
        name: docfile.name,
        type: docfile.mimeType,
      });
    }
  
    try {
      const response = await axios.post('http://192.168.159.183:4000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      Alert.alert('Success', response.data.message);
  
      // Reset form fields after successful upload
      setCategory('Education');
      setDescription('');
      setIsPublic(true);
      setFile(null);
      setDocFile(null);
    } catch (error) {
      Alert.alert('Upload failed', error.response?.data.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };
   
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#181C14" />
          <Text style={styles.screenTitle}>Upload Content</Text>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity 
              style={styles.customDropdown}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.dropdownText}>{category}</Text>
              <Ionicons name="chevron-down" size={20} color="#697565" />
            </TouchableOpacity>

            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Enter a description for your content..."
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              multiline={true}
              numberOfLines={3}
            />

            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.switchLabel}>Visibility</Text>
                <Text style={styles.switchSubLabel}>
                  {isPublic ? 'Anyone can view this content' : 'Only you can view this content'}
                </Text>
              </View>
              <Switch 
                value={isPublic} 
                onValueChange={setIsPublic}
                trackColor={{ false: '#3C3D37', true: '#697565' }}
                thumbColor={isPublic ? '#181C14' : '#E0E0E0'} 
              />
            </View>
          </View>

          <View style={styles.fileSection}>
            <Text style={styles.sectionTitle}>File Upload</Text>
            
            <TouchableOpacity 
              style={[styles.fileButton, file && styles.fileButtonSelected]} 
              onPress={pickFile}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#697565" />
              <Text style={styles.fileButtonText}>Select Media File</Text>
              <Text style={styles.fileLimit}>(Max 100MB)</Text>
            </TouchableOpacity>
            {file && (
              <View style={styles.selectedFileContainer}>
                <Ionicons name={file.mimeType.includes('video') ? 'videocam' : 'image'} size={18} color="#697565" />
                <Text style={styles.fileText} numberOfLines={1} ellipsizeMode="middle">{file.name}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.fileButton, styles.docButton, docfile && styles.fileButtonSelected]} 
              onPress={pickDocFile}
            >
              <Ionicons name="document-text-outline" size={24} color="#697565" />
              <Text style={styles.fileButtonText}>Select Document</Text>
              <Text style={styles.fileLimit}>(Max 10MB, Optional)</Text>
            </TouchableOpacity>
            {docfile && (
              <View style={styles.selectedFileContainer}>
                <Ionicons name="document-text" size={18} color="#697565" />
                <Text style={styles.fileText} numberOfLines={1} ellipsizeMode="middle">{docfile.name}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} 
            onPress={uploadToServer} 
            disabled={uploading}
          >
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color="#E0E0E0" />
                <Text style={styles.uploadButtonText}>Uploading...</Text>
              </View>
            ) : (
              <View style={styles.uploadingContainer}>
                <Ionicons name="arrow-up-circle" size={20} color="#E0E0E0" />
                <Text style={styles.uploadButtonText}>Upload Content</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Add extra padding at the bottom to ensure the upload button is visible */}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* Custom Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#697565" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    category === item && styles.selectedCategoryItem
                  ]}
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.categoryText,
                    category === item && styles.selectedCategoryText
                  ]}>
                    {item}
                  </Text>
                  {category === item && (
                    <Ionicons name="checkmark" size={20} color="#697565" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.categoryList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3C3D37',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#3C3D37',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#3C3D37',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 25,
    marginTop: 10,
  },
  formSection: {
    marginBottom: 20,
    backgroundColor: '#2A2B26',
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#181C14',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#E0E0E0',
  },
  customDropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#181C14',
    marginBottom: 20,
    backgroundColor: '#242520',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#181C14',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#242520',
    color: '#E0E0E0',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  switchSubLabel: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  fileSection: {
    marginBottom: 20,
    backgroundColor: '#2A2B26',
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#181C14',
  },
  fileButton: {
    padding: 15,
    backgroundColor: '#242520',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#181C14',
    borderStyle: 'dashed',
  },
  fileButtonSelected: {
    borderColor: '#697565',
    backgroundColor: '#353632',
    borderStyle: 'solid',
  },
  docButton: {
    backgroundColor: '#242520',
  },
  fileButtonText: {
    color: '#E0E0E0',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fileLimit: {
    color: '#AAA',
    fontSize: 12,
    marginLeft: 6,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#353632',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#697565',
  },
  fileText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginLeft: 8,
    flex: 1,
  },
  uploadButton: {
    padding: 16,
    backgroundColor: '#181C14',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonDisabled: {
    backgroundColor: '#414139',
    shadowOpacity: 0.1,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#E0E0E0',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100, // Add extra padding at the bottom
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#3C3D37',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#181C14',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  categoryList: {
    padding: 10,
  },
  categoryItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2B26',
    borderWidth: 1,
    borderColor: '#181C14',
  },
  selectedCategoryItem: {
    backgroundColor: '#353632',
    borderWidth: 1,
    borderColor: '#697565',
  },
  categoryText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
});

export default UploadScreen;