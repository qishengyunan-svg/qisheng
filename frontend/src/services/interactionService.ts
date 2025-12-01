import { InteractionType } from '../types';
import { getAuthHeaders } from './db';

const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api`;

// Record a user interaction with optional message
export const recordInteraction = async (
  fromUserId: string,
  toUserId: string,
  type: InteractionType,
  message?: string
): Promise<{ isMatch: boolean; interaction: any }> => {
  console.log('Recording interaction:', { fromUserId, toUserId, type, message });

  const response = await fetch(`${API_BASE_URL}/interactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      toUserId,
      type,
      message
    }),
  });

  console.log('Interaction API response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to record interaction');
  }

  const result = await response.json();
  console.log('Interaction result:', result);
  return result;
};

// Update an existing interaction message
export const updateInteractionMessage = async (
  interactionId: string,
  message: string
): Promise<{ interaction: any }> => {
  console.log('Updating interaction message:', { interactionId, message });

  const response = await fetch(`${API_BASE_URL}/interactions/${interactionId}/message`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });

  console.log('Update interaction message API response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update interaction message');
  }

  const result = await response.json();
  console.log('Update interaction message result:', result);
  return result;
};

// Delete an interaction
export const deleteInteraction = async (
  interactionId: string
): Promise<{ interaction: any }> => {
  console.log('Deleting interaction:', { interactionId });

  const response = await fetch(`${API_BASE_URL}/interactions/${interactionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  console.log('Delete interaction API response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete interaction');
  }

  const result = await response.json();
  console.log('Delete interaction result:', result);
  return result;
};
