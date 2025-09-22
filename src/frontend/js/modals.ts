// Modal Management Functions with TypeScript types

export interface ModalOptions {
  showLinks?: boolean;
  pageUrl?: string;
  contentfulSpaceId?: string;
}

export type ModalType = 'success' | 'error' | 'info';

export const showResultModal = (
  type: ModalType,
  title: string,
  message: string,
  options: ModalOptions = {},
): void => {
  const modal = document.getElementById('resultModal') as HTMLDialogElement;
  const modalIcon = document.getElementById('modalIcon') as HTMLElement;
  const modalTitle = document.getElementById('modalTitle') as HTMLElement;
  const modalContent = document.getElementById('modalContent') as HTMLElement;
  const modalLinks = document.getElementById('modalLinks') as HTMLElement;
  const contentfulLink = document.getElementById(
    'contentfulLink',
  ) as HTMLAnchorElement;

  if (!modal || !modalIcon || !modalTitle || !modalContent) return;

  modal.classList.remove('modal-success', 'modal-error', 'modal-info');

  modalIcon.className =
    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold';

  if (type === 'success') {
    modal.classList.add('modal-success');
    modalIcon.classList.add('modal-success-icon');
    modalIcon.textContent = '🎉';
  } else if (type === 'error') {
    modal.classList.add('modal-error');
    modalIcon.classList.add('modal-error-icon');
    modalIcon.textContent = '⚠️';
  } else {
    modal.classList.add('modal-info');
    modalIcon.classList.add('modal-info-icon');
    modalIcon.textContent = 'ℹ️';
  }

  modalTitle.textContent = title;
  modalContent.innerHTML = message.replace(/\n/g, '<br>');

  if (modalLinks && contentfulLink) {
    if (options.showLinks && type === 'success') {
      modalLinks.classList.remove('hidden');

      if (options.pageUrl) {
        contentfulLink.href = options.pageUrl;
      } else if (options.contentfulSpaceId) {
        contentfulLink.href = `https://app.contentful.com/spaces/${options.contentfulSpaceId}/entries`;
      } else {
        contentfulLink.href = 'https://app.contentful.com';
      }
    } else {
      modalLinks.classList.add('hidden');
    }
  }

  modal.showModal();
};

export const hideResultModal = (): void => {
  const modal = document.getElementById('resultModal') as HTMLDialogElement;
  if (modal) {
    modal.close();
  }
};

export const showResetModal = (): void => {
  const modal = document.getElementById('resetModal') as HTMLDialogElement;
  if (modal) {
    modal.showModal();
  }
};
