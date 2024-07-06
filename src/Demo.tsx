import React, { useState, useRef, ChangeEvent } from 'react';
import {
  Card, CardContent, CardHeader, Typography, Avatar, Chip, Button,
  TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  Container, Grid, Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Message as MessageIcon, Send as SendIcon, Image as ImageIcon,
  Camera as CameraIcon, Close as CloseIcon, CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Types
interface Stylist {
  id: number;
  name: string;
  isOnline: boolean;
  photoUrl: string;
  introduction: string;
  specialty: string;
  rating: number;
}

interface Message {
  text: string;
  sender: 'user' | 'stylist';
  image?: string | null;
}

interface StylistProfileProps {
  stylist: Stylist;
  onSelect: (stylist: Stylist) => void;
  onBook: (stylist: Stylist) => void;
}

interface StylistListProps {
  stylists: Stylist[];
  onSelectStylist: (stylist: Stylist) => void;
  onBookStylist: (stylist: Stylist) => void;
}

interface MessageProps {
  message: Message;
}

interface ChatProps {
  stylist: Stylist;
  onBack: () => void;
}

interface BookingModalProps {
  stylist: Stylist | null;
  open: boolean;
  onClose: () => void;
}

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  width: 400,
  margin: theme.spacing(1),
}));

const ScrollableBox = styled(Box)(({ theme }) => ({
  height: 480,
  overflowY: 'auto',
  padding: theme.spacing(2),
}));

// Stylist Profile Component
const StylistProfile: React.FC<StylistProfileProps> = ({ stylist, onSelect, onBook }) => (
  <StyledCard>
    <CardHeader
      avatar={
        <Avatar
          src={`/face_photo/${stylist.photoUrl}`}
          alt={stylist.name}
          sx={{ width: 56, height: 56 }}
        />
      }
      title={stylist.name}
      subheader={
        <Chip
          label={stylist.isOnline ? "オンライン" : "オフライン"}
          color={stylist.isOnline ? "success" : "default"}
          size="small"
        />
      }
    />
    <CardContent>
      <Typography variant="body2" color="text.secondary" align="center">
        {stylist.introduction}
      </Typography>
      <Box mt={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
        <Chip label={stylist.specialty} color="primary" size="small" />
        <Typography variant="body2" mt={1}>
          評価: {stylist.rating}/5
        </Typography>
        <Box mt={2}>
          <Button variant="contained" onClick={() => onSelect(stylist)} sx={{ mr: 1 }}>
            相談する
          </Button>
          <Button variant="outlined" onClick={() => onBook(stylist)} startIcon={<CalendarIcon />}>
            予約
          </Button>
        </Box>
      </Box>
    </CardContent>
  </StyledCard>
);

// Stylist List Component
const StylistList: React.FC<StylistListProps> = ({ stylists, onSelectStylist, onBookStylist }) => (
  <ScrollableBox>
    <Grid container spacing={2} justifyContent="center">
      {stylists.map((stylist) => (
        <Grid item key={stylist.id}>
          <StylistProfile
            stylist={stylist}
            onSelect={onSelectStylist}
            onBook={onBookStylist}
          />
        </Grid>
      ))}
    </Grid>
  </ScrollableBox>
);

// Message Component
const Message: React.FC<MessageProps> = ({ message }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
      mb: 2,
    }}
  >
    <Box
      sx={{
        width: '100%',
        p: 1,
        borderRadius: 1,
        bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.200',
        color: message.sender === 'user' ? 'white' : 'text.primary',
      }}
    >
      <Typography variant="body2">{message.text}</Typography>
      {message.image && (
        <Box component="img" src={message.image} alt="Uploaded" sx={{ width: '100%', mt: 1, borderRadius: 1 }} />
      )}
    </Box>
  </Box>
);

// Chat Component
const Chat: React.FC<ChatProps> = ({ stylist, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [showImageUpload, setShowImageUpload] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSendMessage = () => {
    if (inputMessage.trim() || capturedImage) {
      const newMessage: Message = { text: inputMessage, sender: 'user', image: capturedImage };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      setCapturedImage(null);
      setTimeout(() => {
        setMessages(prev => [...prev, { text: "スタイリストからの返信をお待ちください。", sender: 'stylist' }]);
      }, 1000);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("カメラの起動に失敗しました:", err);
    }
  };

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCapturedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <StyledCard>
      <CardHeader
        title={`${stylist.name}との相談`}
        action={
          <IconButton onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
        }
      />
      <CardContent>
        <ScrollableBox>
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
        </ScrollableBox>
        {showImageUpload ? (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Button startIcon={<CameraIcon />} onClick={startCamera}>
                カメラを起動
              </Button>
              <Button startIcon={<ImageIcon />} onClick={() => fileInputRef.current?.click()}>
                画像を選択
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </Box>
            <video ref={videoRef} autoPlay style={{ width: '100%', marginBottom: 8 }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {capturedImage && (
              <Box position="relative">
                <img src={capturedImage} alt="Captured" style={{ width: '100%', borderRadius: 4 }} />
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                  onClick={() => setCapturedImage(null)}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Button onClick={captureImage}>撮影</Button>
              <Button onClick={() => setShowImageUpload(false)}>完了</Button>
            </Box>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" mb={2}>
            <TextField
              fullWidth
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="メッセージを入力..."
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            <IconButton color="primary" onClick={handleSendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        )}
        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => setShowImageUpload(true)}>
            画像を送信
          </Button>
          <Button variant="outlined" startIcon={<MessageIcon />}>
            ビデオ通話
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

// Booking Modal Component
const BookingModal: React.FC<BookingModalProps> = ({ stylist, open, onClose }) => {
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');

  const handleBooking = () => {
    if (stylist) {
      console.log(`Booking for ${stylist.name} on ${date} at ${time}`);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{stylist?.name}の予約</DialogTitle>
      <DialogContent>
        <TextField
          label="日付"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          margin="normal"
        />
        <TextField
          label="時間"
          type="time"
          fullWidth
          value={time}
          onChange={(e) => setTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleBooking} color="primary">
          予約する
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Application Component
const StylistConsultationService: React.FC = () => {
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [bookingStylist, setBookingStylist] = useState<Stylist | null>(null);
  const [stylists] = useState<Stylist[]>([
    { id: 1, name: "山田花子", isOnline: true, photoUrl: "yamada_hanako.jpg", introduction: "10年のスタイリスト経験があります。カジュアルからフォーマルまで幅広くアドバイスできます。", specialty: "カジュアル", rating: 4.8 },
    { id: 2, name: "鈴木一郎", isOnline: false, photoUrl: "suzuki_ichiro.jpg", introduction: "メンズファッションが得意です。トレンドを押さえたコーディネートをご提案します。", specialty: "メンズ", rating: 4.5 },
  ]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Selecty
      </Typography>
      {selectedStylist ? (
        <Chat
          stylist={selectedStylist}
          onBack={() => setSelectedStylist(null)}
        />
      ) : (
        <StylistList
          stylists={stylists}
          onSelectStylist={setSelectedStylist}
          onBookStylist={setBookingStylist}
        />
      )}
      <BookingModal
        stylist={bookingStylist}
        open={!!bookingStylist}
        onClose={() => setBookingStylist(null)}
      />
    </Container>
  );
};

export default StylistConsultationService;
