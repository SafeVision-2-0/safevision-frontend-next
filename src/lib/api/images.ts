export async function uploadImage(
  file: File,
  profileId: string,
): Promise<{ success: boolean; message: string; data?: any }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('profileId', profileId);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile-image/`, {
    method: 'POST',
    body: formData,
  });

  return res.json();
}

export async function getImagesByPerson(profileId: string): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/${profileId}/profile-images`, {
    cache: 'no-store',
  });

  return res.json();
}

export async function deleteImage(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile-image/${id}`, {
    method: 'DELETE',
  });

  return res.json();
}
